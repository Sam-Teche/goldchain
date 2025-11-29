#![cfg_attr(not(feature = "std"), no_std, no_main)]

use ink::prelude::string::String;
use ink::prelude::vec::Vec;
use ink::storage::Mapping;

#[ink::contract]
pub mod goldchain_sc {
    use super::*;

    #[derive(scale::Encode, scale::Decode, Clone, Debug, PartialEq, Eq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Config {
        pub admin: AccountId,
    }

    #[derive(scale::Encode, scale::Decode, Clone, Debug, PartialEq, Eq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Ledger {
        pub tracking_id: String,
        pub lot_id: String,
        pub recorded_at: u64,  
    }

    #[ink(storage)]
    pub struct GoldchainSc {
  
        config: Option<Config>,

        ledgers: Mapping<[u8; 32], Ledger>,
        ledger_keys: Vec<[u8; 32]>,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        UnauthorizedAuthority,
        AlreadyInitialized,
        NotInitialized,
        LedgerAlreadyExists,
        StringTooLong,
    }

    impl Default for GoldchainSc {
        fn default() -> Self {
            Self::new()
        }
    }

    impl GoldchainSc {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                config: None,
                ledgers: Mapping::default(),
                 ledger_keys: Vec::new(),
            }
        }

        fn make_key(tracking_id: &str, lot_id: &str) -> [u8; 32] {  
            use ink::env::hash::{Blake2x256, HashOutput};

            let mut input = b"ledger".to_vec();
            input.extend_from_slice(tracking_id.as_bytes());
            input.extend_from_slice(lot_id.as_bytes());

            let mut output = <Blake2x256 as HashOutput>::Type::default();
            ink::env::hash_bytes::<Blake2x256>(&input, &mut output);
            output
        }

  
        fn validate_string_length(s: &str) -> Result<(), Error> {  
            if s.len() > 256 {
                return Err(Error::StringTooLong);
            }
            Ok(())
        }

        #[ink(message)]
        pub fn initialize(&mut self) -> Result<(), Error> {
            if self.config.is_some() {
                return Err(Error::AlreadyInitialized);
            }

            let caller = Self::env().caller();

            self.config = Some(Config { admin: caller });

            Ok(())
        }

        #[ink(message)]
        pub fn add_ledger(
            &mut self,
            tracking_id: String,
            lot_id: String,
        ) -> Result<(), Error> {
  
            let config = self.config.as_ref().ok_or(Error::NotInitialized)?;

            Self::validate_string_length(&tracking_id)?;
            Self::validate_string_length(&lot_id)?;

            let caller = Self::env().caller();
            if caller != config.admin {
                return Err(Error::UnauthorizedAuthority);
            }

            let key = Self::make_key(&tracking_id, &lot_id);

            if self.ledgers.contains(key) {  
                return Err(Error::LedgerAlreadyExists);
            }

            let timestamp = Self::env().block_timestamp();  
            
            let ledger = Ledger {
                tracking_id,
                lot_id,
                recorded_at: timestamp,
            };

            self.ledgers.insert(key, &ledger);
            self.ledger_keys.push(key);

            Ok(())
        }

        #[ink(message)]
        pub fn get_all_ledgers(&self) -> Vec<Ledger> {
            self.ledger_keys
                .iter()
                .filter_map(|key| self.ledgers.get(key))
                .collect()
        }

        #[ink(message)]
        pub fn get_ledger(
            &self,
            tracking_id: String,
            lot_id: String,
        ) -> Option<Ledger> {
            let key = Self::make_key(&tracking_id, &lot_id);
            self.ledgers.get(key) 
        }

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

            contract
                .add_ledger(String::from("TRACK001"), String::from("LOT001"))
                .unwrap();

            let result =
                contract.add_ledger(String::from("TRACK001"), String::from("LOT001"));
            assert_eq!(result, Err(Error::LedgerAlreadyExists));
        }

        #[ink::test]
        fn test_unauthorized() {
            let accounts =
                ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = GoldchainSc::new();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            contract.initialize().unwrap();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let result =
                contract.add_ledger(String::from("TRACK001"), String::from("LOT001"));
            assert_eq!(result, Err(Error::UnauthorizedAuthority));
        }

        #[ink::test]
        fn test_string_length_limit() {
            let mut contract = GoldchainSc::new();
            contract.initialize().unwrap();

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
