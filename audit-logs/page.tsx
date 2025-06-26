"use client";

import { useEffect, useState } from "react";
import {
	Checkbox,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
} from "@mui/material";
import { Search } from "lucide-react";
import { activityTableHeaders } from "../../../components/ui/tableHeaders";
import { getAuditLogList } from "../../../services/auditLogApiService";
import { RootState, useAppSelector } from "../../../store/store";
import { tailwindStyles } from "../../../styles/tailwindStyles";
import TablePagination from "../../../components/ui/Pagination";
import { formatDate } from "../../../constants/fieldtype";

// Define User data type
interface User {
	projectId: string;
	activity: string;
	user_name: string;
	timestamp: string;
	organization_id: string;
	dataset: string;
	project_docket: string;
	id: string;
}


const AuditLogsPage: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	// const [selectedRows, setSelectedRows] = useState<string[]>([]);
	// const [, setIsFilterOpen] = useState<boolean>(false);
	const [auditLogs, setAuditLogs] = useState<User[]>([]);


	const [queryStrings, setQueryString] = useState({
		page: 1,
		pageSize: 10,
		search: "",
		filters: " ",
	});
	const [auditListPageInfo, setAuditListPageInfo] = useState<{
		pagingInfo?: {
			total_page: number;
			current_page: number;
			item_per_page: number;
			total_items: number;
		};
	}>({});

	// const [isLoading, setIsLoading] = useState<boolean>(true);
	const userDetail = useAppSelector((state: RootState) => state?.user?.userDetail,);


	useEffect(() => {
		const fetchAuditLogs = async () => {
			try {
				const roleName = userDetail?.role?.name;
				const organizationId = userDetail?.organization?.id;
				const { page, pageSize } = queryStrings;

				const response = await getAuditLogList(
					roleName,
					organizationId,
					page,
					pageSize,
					searchQuery // Pass searchQuery as username
				);

				setAuditLogs(response.data.data);
				setAuditListPageInfo({ pagingInfo: response.data.paging_info });
			} catch (error) {
				console.error("Failed to fetch audit logs:", error);
			}
		};

		if (userDetail?.role?.name && userDetail?.organization?.id) {
			fetchAuditLogs();
		}
	}, [queryStrings, userDetail, searchQuery]); // add searchQuery to dependency array


	return (
		<>
			{/* <FilterSidebar open={isFilterOpen} onClose={() => setIsFilterOpen(false)} /> */}
			<div className="bg-white p-6 min-h-screen">
				{/* Header */}
				<div className="flex justify-between items-center ">
					<h1 className="text-2xl font-bold text-[#000000]">Audit Logs</h1>
				</div>

				<div className="border border-gray-300 shadow-md rounded-md p-4 mt-4">
					<div className="grid grid-cols-12 gap-4 mb-4 items-center">
						<div className={tailwindStyles.auditsearchiconDiv}>
							<Search className="text-gray-400 mr-2" size={18} />
							<input
								type="text"
								placeholder="Search by User Email"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full outline-none bg-transparent"
								style={{ color: "#000000" }}
							/>
						</div>
					</div>

					<TableContainer
						component={Paper}
						style={{ height: "37rem", overflowX: "auto", width: "100%" }}
						className="mt-4 border border-gray-300 rounded-md shadow-sm"
					>
						<Table>
							<TableHead>
								<TableRow className="bg-gray-100">
									{/* <TableCell padding="checkbox">
										<Checkbox  sx={{ '&.Mui-checked': {   color: '#FF6900' , },}}/>
									</TableCell> */}
									{activityTableHeaders.map((header) => (
										<TableCell
											key={header}
											sx={{
												fontWeight: "bold",
												fontSize: "18px",
												color: "#475569",
												whiteSpace: "nowrap"
											}}
										>
											{header}
										</TableCell>
									))}
								</TableRow>
							</TableHead>

							<TableBody>
								{auditLogs.length > 0 ? (
									auditLogs.map((user) => (
										<TableRow key={user.id} className="hover:bg-gray-50">
											{/* <TableCell padding="checkbox">
												<Checkbox sx={{ '&.Mui-checked': { color: '#FF6900',},}} />
											</TableCell> */}
											<TableCell className={tailwindStyles.cellStyle} style={{ whiteSpace: "nowrap", fontWeight: "400" }} >{formatDate(user?.timestamp) || "-"}</TableCell>
											<TableCell className={tailwindStyles.cellStyle} style={{ whiteSpace: "nowrap", fontWeight: "400" }} >{user?.user_name || "-"}</TableCell>
											<TableCell className={tailwindStyles.cellStyle} style={{ whiteSpace: "nowrap", fontWeight: "400" }} >{user?.activity || "-"}</TableCell>
											{/* <TableCell className={tailwindStyles.cellStyle}>{user.organization_id}</TableCell> */}
											<TableCell className={tailwindStyles.cellStyle} style={{ whiteSpace: "nowrap", fontWeight: "400" }} >{user?.project_docket || "-"}</TableCell>
											<TableCell className={tailwindStyles.cellStyle} style={{ whiteSpace: "nowrap", fontWeight: "400" }} >{user?.dataset || "-"}</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={7} align="center" sx={{ fontStyle: "italic", color: "#9ca3af" }}>
											Data not found
										</TableCell>
									</TableRow>
								)}
							</TableBody>

						</Table>
					</TableContainer>
					<TablePagination
						queryStrings={queryStrings}
						setQueryString={setQueryString}
						paging={auditListPageInfo?.pagingInfo || { total_page: 0, current_page: 0, item_per_page: 0, total_items: 0 }}
					/>

				</div>
			</div>
		</>
	);
};

export default AuditLogsPage;
