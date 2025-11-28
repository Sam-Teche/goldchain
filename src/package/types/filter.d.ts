type Filter = {
    page?: number;
    limit?: number;
    searchTerm?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: string;
    maxAmount?: string;
    minRating?: number
    maxRating?: number
    sortBy?: "amount" | "createdAt" | "updatedAt",
    sortOrder?: "ascending" | "descending" | "desc" | "asc",
};

export default Filter;