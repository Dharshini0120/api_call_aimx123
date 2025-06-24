"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
	Box,
	Tabs,
	Tab,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Checkbox,
	FormControl,
	Select,
	MenuItem,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CustomButton from "../../../components/ui/Button";
import AddnewRoleModal from "./AddnewRoleModel";
import {
	roleList,
	moduleList,
	permissionList,
	addPermission,
	getPermissionData,
	updatePermissionData,
} from "../../../services/rolesapiService";
import DeleteRoleModal from "./DeleteRoleModel";
import type { Role } from "../../../components/interface/rolesInterface";
import { toast } from "react-toastify";

// interface Module {
// 	id: string;
// 	name: string;
// 	create?: boolean;
// 	read?: boolean;
// 	update?: boolean;
// 	delete?: boolean;
// 	[key: string]: string | boolean | undefined;
// }

// const PERMISSION_NAMES = ["create", "read", "update", "delete"] as const;

const RoleAndAccessPage: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [tabValue, setTabValue] = useState(0);
	const handleOpenModal = () => setIsModalOpen(true);
	const handleCloseModal = () => setIsModalOpen(false);
	const [selectedRole, setSelectedRole] = useState("");
	const [rolesListData, setRolesListData] = useState<Role[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
	const [selectedRoleDetails, setSelectedRoleDetails] = useState<Role | null>(
		null,
	);
	const [permissionAccess, setPermissionAccess] = useState<Role[]>([]);
	const [accessRights, setAccessRights] = useState([]);
	const clearSelectedRoleDetails = () => setSelectedRoleDetails(null);

	useEffect(() => {
		if (rolesListData.length > 0) {
			const selectedExists = rolesListData.some((r) => r.name === selectedRole);
			if (!selectedExists) {
				setSelectedRole(rolesListData[0].name);
			}
		} else {
			setSelectedRole("select Role");
		}
	}, [rolesListData, selectedRole]);

	const handleOpenDeleteModal = (id) => {
		setIsDeleteModalOpen(true);
		setSelectedRoleId(id);
	};
	const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

	const fetchPermissionData = async () => {
		setLoading(true);
		try {
			const res = await permissionList();
			setPermissionAccess(res.data);
		} catch (err) {
			console.error("Failed to fetch form data:", err);
		} finally {
			setLoading(false);
		}
	};
	const fetchRoleData = async () => {
		setLoading(true);
		try {
			const res = await roleList();
			setRolesListData(res.data);
		} catch (err) {
			console.error("Failed to fetch form data:", err);
		} finally {
			setLoading(false);
		}
	};

	const fetchModuleData = async () => {
		setLoading(true);
		try {
			const res = await moduleList();
			setAccessRights(res.data);
		} catch (err) {
			console.error("Failed to fetch form data:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRoleData();
		fetchModuleData();
		fetchPermissionData();
	}, []);

	useEffect(() => {
		if (selectedRole) {
			fetchRolePermissions();
		}
	}, [selectedRole, rolesListData]);

	const fetchRolePermissions = async () => {
		const selected = rolesListData.find((role) => role.name === selectedRole);
		if (!selected) return;

		setAccessRights((prev) =>
			prev.map((module) => ({
				...module,
				create: false,
				read: false,
				update: false,
				delete: false,
			})),
		);

		try {
			const res = await getPermissionData(selected.id);
			const roleModules = res.data.modules;

			const updatedRights = accessRights.map((module) => {
				const foundModule = roleModules.find((m) => m.module_id === module.id);
				if (!foundModule)
					return {
						...module,
						create: false,
						read: false,
						update: false,
						delete: false,
					};

				const modulePermissions = foundModule.permissions.map((p) =>
					p.permission_name.toLowerCase(),
				);

				return {
					...module,
					create: modulePermissions.includes("create"),
					read: modulePermissions.includes("read"),
					update: modulePermissions.includes("update"),
					delete: modulePermissions.includes("delete"),
				};
			});

			setAccessRights(updatedRights);
		} catch (error) {
			console.error("Error fetching role permission details:", error);
		}
	};

	const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) =>
		setTabValue(newValue);
	const handleCheckboxChange = (index: number, field: string) => {
		setAccessRights((prev) => {
			const updatedRights = [...prev];
			updatedRights[index] = {
				...updatedRights[index],
				[field]: !updatedRights[index][field],
			};
			return updatedRights;
		});
	};
	const handleEdit = (role) => {
		setSelectedRoleDetails(role);
		handleOpenModal();
	};

	const handleSavePermission = async () => {
		try {
			if (!selectedRole) {
				console.warn("No role selected.");
				return;
			}

			const selectedRoleObj = rolesListData.find(
				(role) => role.name === selectedRole,
			);
			if (!selectedRoleObj) {
				console.warn("Selected role not found in list.");
				return;
			}

			const roleId = selectedRoleObj.id;
			const module_ids: string[] = [];
			const permission_ids: string[][] = [];

			accessRights.map((module) => {
				const permissionGroup: string[] = [];

				if (module.create) {
					const createPermission = permissionAccess.find(
						(p) => p.name === "create",
					);
					if (createPermission) permissionGroup.push(createPermission.id);
				}
				if (module.read) {
					const readPermission = permissionAccess.find(
						(p) => p.name === "read",
					);
					if (readPermission) permissionGroup.push(readPermission.id);
				}
				if (module.update) {
					const updatePermission = permissionAccess.find(
						(p) => p.name === "update",
					);
					if (updatePermission) permissionGroup.push(updatePermission.id);
				}
				if (module.delete) {
					const deletePermission = permissionAccess.find(
						(p) => p.name === "delete",
					);
					if (deletePermission) permissionGroup.push(deletePermission.id);
				}

				module_ids.push(module.id);
				permission_ids.push(permissionGroup);
			});

			const finalPayload = {
				role_id: roleId,
				module_id: module_ids,
				permission_id: permission_ids,
			};

			const existingPermissions = await getPermissionData(roleId);
			const isFirstTime = !existingPermissions?.data?.modules?.length;

			const res = isFirstTime
				? await addPermission(finalPayload)
				: await updatePermissionData(finalPayload);

			fetchRolePermissions();
			toast.success(res?.data?.message || "Permissions saved successfully!");
		} catch (error) {
			console.error("Error saving permissions:", error);
			toast.error("Failed to save permissions.");
		}
	};

	return (
		<>
			{isModalOpen && (
				<AddnewRoleModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					fetchRoleDataApi={fetchRoleData}
					selectedRoleDetails={selectedRoleDetails}
					clearSelectedRoleDetails={clearSelectedRoleDetails}
				/>
			)}
			{isDeleteModalOpen && (
				<DeleteRoleModal
					isOpen={isDeleteModalOpen}
					onClose={handleCloseDeleteModal}
					fetchRoleDataApi={fetchRoleData}
					selectedRoleId={selectedRoleId}
				/>
			)}
			<Box className="bg-white p-6 min-h-screen">
				<Box className="flex justify-between items-center pb-4">
					<Typography sx={{
							fontSize: {
								xs: "1.25rem",
								sm: "1.5rem",
								},
								fontWeight: "bold",
								color: "#000000",
								whiteSpace: "nowrap",
							}}>
						Roles & Access
					</Typography>
					<CustomButton
						text="Add New Role"
						onClick={handleOpenModal}
						isLoading={false}
					/>
				</Box>
				<Box className="border-b border-gray-300">
					<Tabs
						value={tabValue}
						onChange={handleChangeTab}
						className="text-black"
						sx={{
							".MuiTabs-indicator": { display: "none" },
						}}
					>
						<Tab
							label="Roles"
							className="font-bold normal-case text-transform-none"
							sx={{
								color: "black !important",
								fontWeight: "bold",
								fontSize: "1rem",
								"&.Mui-selected": {
									backgroundColor: "#FEF4ED",
									borderRadius: "8px",
									color: "black !important",
								},
							}}
						/>
						<Tab
							label="Access Rights"
							className="font-bold normal-case text-transform-none"
							sx={{

								color: "black !important",
								fontWeight: "bold",
								fontSize: "1rem",
								"&.Mui-selected": {
									backgroundColor: "#FEF4ED",
									borderRadius: "8px",
									color: "black !important",
								},
							}}
						/>
					</Tabs>
				</Box>

				{tabValue === 0 && (
					<Box
						className="border border-gray-300 rounded-lg overflow-hidden"
						sx={{
							minHeight: "calc(90vh - 200px)",
							display: "flex",
							flexDirection: "column",
							maxHeight: 360,
							overflow: "auto",
							overflowX: "hidden",
						}}
					>
						<TableContainer
							component={Paper}
							className="shadow-none rounded-lg px-4 py-2 flex-grow mt-10"
						>
							<Table
								sx={{
									width: "90%",
									margin: "auto",
									border: "1px solid #d1d5db",
								}}
							>
								<TableHead>
									<TableRow sx={{ borderBottom: "2px solid #d1d5db" }}>
										<TableCell
											sx={{
												fontSize: "16px",
												fontWeight: "600",
												fontFamily: "Open Sans",
												color: "#5E6A7C",
												whiteSpace:"nowrap"
											}}
										>
											S.No
										</TableCell>
										<TableCell
											sx={{
												fontSize: "16px",
												fontWeight: "600",
												fontFamily: "Open Sans",
												color: "#5E6A7C",
												whiteSpace:"nowrap"
											}}
										>
											Role Name
										</TableCell>
										<TableCell
											sx={{
												fontSize: "16px",
												fontWeight: "600",
												fontFamily: "Open Sans",
												color: "#5E6A7C",
												whiteSpace:"nowrap"
											}}
										>
											Description
										</TableCell>
										<TableCell
											sx={{
												fontSize: "16px",
												fontWeight: "600",
												fontFamily: "Open Sans",
												color: "#5E6A7C",
												whiteSpace:"nowrap",
											}}
										>
											Action
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody className="mb-20">
									{loading ? (
										<TableRow>
											<TableCell colSpan={4}>
												<div className="flex justify-center items-center h-full">
													<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
												</div>
											</TableCell>
										</TableRow>
									) : rolesListData.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4}>
												<div className="flex justify-center items-center h-32 text-gray-500">
													No data found
												</div>
											</TableCell>
										</TableRow>
									) : (
										rolesListData.map((role, index) => (
											<TableRow
												key={role.id}
												className={index % 2 === 1 ? "bg-[#FEF4ED]" : ""}
											>
												<TableCell sx={{ color: "#5f6163" }}>{index + 1}</TableCell>
												<TableCell sx={{ color: "#5f6163",whiteSpace:"nowrap" }}>{role.name}</TableCell>
												<TableCell sx={{ color: "#5f6163" ,whiteSpace:"nowrap"}}>
													{role.description ? role.description : "No description"}
												</TableCell>
												<TableCell className="flex gap-2 whitespace-nowrap">
													<IconButton onClick={() => handleEdit(role)}>
														<EditOutlinedIcon />
													</IconButton>
													<IconButton>
														<DeleteOutlinedIcon onClick={() => handleOpenDeleteModal(role.id)} />
													</IconButton>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>

							</Table>
						</TableContainer>
					</Box>
				)}

				{tabValue === 1 && (
					<Box
						className="border border-gray-300 rounded-lg overflow-hidden"
						sx={{
							minHeight: "calc(90vh - 200px)",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Box className="px-6 py-4">
							<FormControl fullWidth sx={{ maxWidth: 300 }}>
								<Typography
									variant="subtitle2"
									sx={{
										color: "#5E6A7C",
										fontWeight: 600,
										marginBottom: "8px",
										fontSize: "14px",
									}}
								>
									Select Role
								</Typography>

								<Select
									value={selectedRole}
									onChange={(e) => setSelectedRole(e.target.value)}
									displayEmpty
									sx={{
										backgroundColor: "#FEF4ED",
										borderRadius: "8px",
										".MuiOutlinedInput-notchedOutline": {
											borderColor: "#E5E7EB",
										},
										"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
											borderColor: "#E5E7EB",
										},
										height: "42px",
									}}
								>
									<MenuItem value="select" disabled>
										Select Role
									</MenuItem>

									{rolesListData.map((role) => (
										<MenuItem key={role.id} value={role.name}>
											{role.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>

						<TableContainer
							component={Paper}
							className="shadow-none rounded-lg px-4 py-2 flex-grow mt-4"
						>
							<Table
								sx={{
									width: "90%",
									margin: "auto",
									border: "1px solid #d1d5db",
									whiteSpace:"nowrap"
								}}
							>
								<TableHead>
									<TableRow>
										<TableCell sx={{ fontWeight: "600", color: "#5E6A7C" ,whiteSpace:"nowrap"}}>
											Module
										</TableCell>
										{permissionAccess.map((action) => (
											<TableCell
												key={action.id || action.name}
												className="text-capitalize"
												sx={{ fontWeight: "600", color: "#5E6A7C",whiteSpace:"nowrap" }}
											>
												{action.name}
											</TableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{loading ? (
										<TableRow>
											<TableCell colSpan={5}>
												<div className="flex justify-center items-center h-full">
													<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
												</div>
											</TableCell>
										</TableRow>
									) : accessRights.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5}>
												<div className="flex justify-center items-center h-32 text-gray-500">
													No data found
												</div>
											</TableCell>
										</TableRow>
									) : (
										accessRights.map((right, index) => (
											<TableRow
												key={right.id || right.name || index}
												className={index % 2 === 1 ? "bg-[#FEF4ED]" : ""}
											>
												<TableCell>{right.name}</TableCell>
												<TableCell>
													<Checkbox
														checked={right.create}
														onChange={() => handleCheckboxChange(index, "create")}
													/>
												</TableCell>
												<TableCell>
													<Checkbox
														checked={right.read}
														onChange={() => handleCheckboxChange(index, "read")}
													/>
												</TableCell>
												<TableCell>
													<Checkbox
														checked={right.update}
														onChange={() => handleCheckboxChange(index, "update")}
													/>
												</TableCell>
												<TableCell>
													<Checkbox
														checked={right.delete}
														onChange={() => handleCheckboxChange(index, "delete")}
													/>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>

							</Table>

							<Box className="flex justify-center gap-4 mt-6 px-6">
								{/* <Button
									variant="outlined"
									sx={{
										borderColor: "#F97316",
										color: "#F97316",
										textTransform: "none",
										fontWeight: "bold",
										padding: "8px 20px",
										borderRadius: "8px",
										width: "170px",
										"&:hover": {
											borderColor: "#ea580c",
											backgroundColor: "#FEF4ED",
										},
									}}
								>
									Cancel
								</Button> */}
								<CustomButton
									text="Save For Changes"
									isLoading={false}
									onClick={handleSavePermission}
								/>
							</Box>
						</TableContainer>
					</Box>
				)}
			</Box>
		</>
	);
};
export default RoleAndAccessPage;
