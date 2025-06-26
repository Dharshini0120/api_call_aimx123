"use client";

import Pagination from "@mui/material/Pagination";
import { Typography, Select, MenuItem, FormControl } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type React from "react";
import PropTypes from "prop-types";

interface QueryStrings {
	page: number;
	pageSize: string | number;
}

interface Paging {
	total_page: number;
	current_page: number;
	item_per_page: number;
	total_items: number;
}

interface TablePaginationProps {
	queryStrings: QueryStrings;
	setQueryString: React.Dispatch<React.SetStateAction<QueryStrings>>;
	paging: Paging;
}

const TablePagination: React.FC<TablePaginationProps> = ({
	queryStrings,
	setQueryString,
	paging,
}) => {
	const handlePageSizeChange = (event: SelectChangeEvent<string | number>) => {
		const payload = { ...queryStrings };
		payload.pageSize = event.target.value as string;
		payload.page = 1; // optional: Reset page to 1 when page size changes
		setQueryString(payload);
	};

	const handleChange = (e: React.ChangeEvent<unknown>, p: number) => {
		const payload = { ...queryStrings };
		payload.page = p;
		setQueryString(payload);
	};

	return (
	<div className="w-full flex flex-col items-center justify-center gap-4 mt-2 md:flex-row md:justify-between md:items-center">
			{/* Rows per page */}
			<div className="flex items-center justify-start gap-2">
				<Typography variant="subtitle2" className="text-sm md:text-base text-[#000000]">
					Rows per page:
				</Typography>
				<FormControl variant="outlined" size="small">
					<Select
						value={queryStrings.pageSize || "100"}
						onChange={handlePageSizeChange}
						displayEmpty
						size="small"
						sx={{
							fontSize: "0.7rem",
							minWidth: "60px",
							height: "30px",
							".MuiSelect-select": {
								padding: "4px 8px",
							},
						}}
						MenuProps={{
							PaperProps: {
								sx: {
									maxHeight: 120,
									fontSize: "0.7rem",
								},
							},
						}}
					>
						<MenuItem value="10">10</MenuItem>
						<MenuItem value="50">50</MenuItem>
						<MenuItem value="All">All</MenuItem>
					</Select>
				</FormControl>
			</div>

			{/* Pagination and Info */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 md:gap-4">
				<Pagination
					count={paging?.total_page}
					size="medium"
					page={queryStrings.page}
					variant="outlined"
					shape="rounded"
					onChange={handleChange}
					showFirstButton
					showLastButton
					siblingCount={0}
					boundaryCount={1}
					sx={{
						"& .MuiPaginationItem-root": {
							minWidth: "27px",
							height: "27px",
						},
					}}
				/>
				{paging && paging.total_items !== 0 ? (
					<Typography variant="subtitle2" className="text-sm md:text-base text-[#000000]">
						Showing{" "}
						{paging.current_page * paging.item_per_page +
							1 -
							paging.item_per_page}{" "}
						-{" "}
						{paging?.item_per_page * queryStrings.page > paging?.total_items
							? paging?.total_items
							: paging?.item_per_page * queryStrings.page}{" "}
						out of {paging?.total_items}
					</Typography>
				) : (
					<Typography variant="subtitle2" className="text-sm md:text-base text-[#000000]">
						Showing 0 - 0 out of 0
					</Typography>
				)}
			</div>
		</div>
	);
};

TablePagination.propTypes = {
	queryStrings: PropTypes.object.isRequired,
	setQueryString: PropTypes.func.isRequired,
	paging: PropTypes.object,
};

export default TablePagination;
