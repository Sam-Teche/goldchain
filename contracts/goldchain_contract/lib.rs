#![cfg_attr(not(feature = "std"), no_std, no_main)]

use ink::prelude::string::String;
use ink::storage::Mapping;

#[ink::contract]
pub mod goldchain_sc {
    use super::*;

    /// Config struct - stores admin address
    #[derive(scale::Encode, scale::Decode, Clone, Debug, PartialEq, Eq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Config {
        pub admin: AccountId,
    }

    /// Ledger struct - stores tracking data
    #[derive(scale::Encode, scale::Decode, Clone, Debug, PartialEq, Eq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Ledger {
        pub tracking_id: String,
        pub lot_id: String,
        pub recorded_at: u64,  // ← FIXED: Changed from i64 to u64
    }

    #[ink(storage)]
    pub struct GoldchainSc {
        /// Config account (like Solana's PDA config)
        config: Option<Config>,
        /// Ledgers mapping: key -> Ledger
        ledgers: Mapping<[u8; 32], Ledger>,
    }

    /// Error types
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Caller is not the required authority
        UnauthorizedAuthority,
        /// Contract already initialized
        AlreadyInitialized,
        /// Contract not initialized
        NotInitialized,
        /// Ledger already exists (matches Solana's PDA behavior)
        LedgerAlreadyExists,
        /// String exceeds maximum length of 256 characters
        StringTooLong,
    }

    impl Default for GoldchainSc {
        fn default() -> Self {
            Self::new()
        }
    }

    impl GoldchainSc {
        /// Constructor - creates empty contract (not initialized yet)
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                config: None,
                ledgers: Mapping::default(),
            }
        }

        /// Compute key from tracking_id + lot_id (like Solana's PDA seeds)
        fn make_key(tracking_id: &str, lot_id: &str) -> [u8; 32] {  // ← FIXED: Changed &String to &str
            use ink::env::hash::{Blake2x256, HashOutput};

            let mut input = b"ledger".to_vec();
            input.extend_from_slice(tracking_id.as_bytes());
            input.extend_from_slice(lot_id.as_bytes());

            let mut output = <Blake2x256 as HashOutput>::Type::default();
            ink::env::hash_bytes::<Blake2x256>(&input, &mut output);
            output
        }

        /// Validate string length (max 256 chars like Solana)
        fn validate_string_length(s: &str) -> Result<(), Error> {  // ← FIXED: Changed &String to &str
            if s.len() > 256 {
                return Err(Error::StringTooLong);
            }
            Ok(())
        }

        /// Initialize - sets admin (matches Solana's initialize function)
        #[ink(message)]
        pub fn initialize(&mut self) -> Result<(), Error> {
            // Check if already initialized
            if self.config.is_some() {
                return Err(Error::AlreadyInitialized);
            }

            let caller = Self::env().caller();

            self.config = Some(Config { admin: caller });

            Ok(())
        }

        /// Add ledger - only admin can call (matches Solana's add_ledger)
        #[ink(message)]
        pub fn add_ledger(
            &mut self,
            tracking_id: String,
            lot_id: String,
        ) -> Result<(), Error> {
            // Check if initialized
            let config = self.config.as_ref().ok_or(Error::NotInitialized)?;

            // Validate string lengths (max 256 like Solana)
            Self::validate_string_length(&tracking_id)?;
            Self::validate_string_length(&lot_id)?;

            // Check authorization (only admin)
            let caller = Self::env().caller();
            if caller != config.admin {
                return Err(Error::UnauthorizedAuthority);
            }

            // Create key (like Solana's PDA)
            let key = Self::make_key(&tracking_id, &lot_id);

            // Check if ledger already exists (like Solana's PDA duplicate check)
            if self.ledgers.contains(key) {  // ← FIXED: Removed unnecessary &
                return Err(Error::LedgerAlreadyExists);
            }

            // Get timestamp (unix timestamp like Solana)
            let timestamp = Self::env().block_timestamp();  // ← FIXED: No conversion needed now
            
            // Create and store ledger
            let ledger = Ledger {
                tracking_id,
                lot_id,
                recorded_at: timestamp,
            };

            self.ledgers.insert(key, &ledger);

            Ok(())
        }

        /// Get ledger by tracking_id and lot_id
        #[ink(message)]
        pub fn get_ledger(
            &self,
            tracking_id: String,
            lot_id: String,
        ) -> Option<Ledger> {
            let key = Self::make_key(&tracking_id, &lot_id);
            self.ledgers.get(key)  // ← FIXED: Removed unnecessary &
        }

        /// Get config (admin address)
        #[ink(message)]
        pub fn get_config(&self) -> Option<Config> {
            self.config.clone()
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test_initialize() {
            let mut contract = GoldchainSc::new();
            let result = contract.initialize();
            assert!(result.is_ok());

            // Cannot initialize twice
            let result2 = contract.initialize();
            assert_eq!(result2, Err(Error::AlreadyInitialized));
        }

        #[ink::test]
        fn test_add_ledger() {
            let mut contract = GoldchainSc::new();
            contract.initialize().unwrap();

            let result = contract.add_ledger(
                String::from("TRACK001"),
                String::from("LOT001"),
            );
            assert!(result.is_ok());
        }

        #[ink::test]
        fn test_duplicate_ledger() {
            let mut contract = GoldchainSc::new();
            contract.initialize().unwrap();

            // Add first ledger
            contract
                .add_ledger(String::from("TRACK001"), String::from("LOT001"))
                .unwrap();

            // Try to add duplicate - should fail
            let result =
                contract.add_ledger(String::from("TRACK001"), String::from("LOT001"));
            assert_eq!(result, Err(Error::LedgerAlreadyExists));
        }

        #[ink::test]
        fn test_unauthorized() {
            let accounts =
                ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = GoldchainSc::new();

            // Alice initializes
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            contract.initialize().unwrap();

            // Bob tries to add ledger - should fail
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let result =
                contract.add_ledger(String::from("TRACK001"), String::from("LOT001"));
            assert_eq!(result, Err(Error::UnauthorizedAuthority));
        }

        #[ink::test]
        fn test_string_length_limit() {
            let mut contract = GoldchainSc::new();
            contract.initialize().unwrap();

            // Create string longer than 256 characters
            let long_string = "a".repeat(257);

            let result = contract.add_ledger(long_string, String::from("LOT001"));
            assert_eq!(result, Err(Error::StringTooLong));
        }

        #[ink::test]
        fn test_get_ledger() {
            let mut contract = GoldchainSc::new();
            contract.initialize().unwrap();

            contract
                .add_ledger(String::from("TRACK001"), String::from("LOT001"))
                .unwrap();

            let ledger =
                contract.get_ledger(String::from("TRACK001"), String::from("LOT001"));
            assert!(ledger.is_some());

            let ledger = ledger.unwrap();
            assert_eq!(ledger.tracking_id, "TRACK001");
            assert_eq!(ledger.lot_id, "LOT001");
        }
    }
}