"use client";

import type React from "react";
import { useState } from "react";
import {
    Modal,
    Box,
    Typography,
    Button,
    IconButton,
    CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { roleDelete } from "../../../services/rolesapiService";
import { toast } from "react-toastify";
import type { DeleteModalProps } from "../../../components/interface/rolesInterface";



const DeleteRoleModal: React.FC<DeleteModalProps> = ({
    isOpen,
    onClose,
    selectedRoleId,
    fetchRoleDataApi,
}) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!selectedRoleId) {
            toast.error("Invalid Role ID.");
            return;
        }

        setLoading(true);
        try {
            const res = await roleDelete(selectedRoleId);
            toast.success(res?.data?.message || "Role deleted successfully");
            fetchRoleDataApi(); // Refresh list
            onClose(); // Close modal
        } catch (err: unknown) {
            toast.error( "Failed to delete role");
            console.error("Delete error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={isOpen} onClose={onClose} aria-labelledby="delete-role-modal-title">
            <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                bg-white rounded-lg shadow-xl p-6 w-[500px] max-w-full"
            >
                {/* Header */}
                <div className="flex justify-between items-center pb-3">
                    <Typography
                        id="delete-role-modal-title"
                        variant="h6"
                        className="font-bold text-md font-['Open_Sans'] text-[#000000]"
                    >
                        Delete Role
                    </Typography>
                    <IconButton onClick={onClose} className="text-gray-500 hover:text-red-500">
                        <CloseIcon />
                    </IconButton>
                </div>

                {/* Confirmation Message */}
                <div className="text-center mt-4">
                    <Typography className="text-base font-semibold font-['Open_Sans'] text-gray-700">
                        Are you sure you want to delete this role?
                    </Typography>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center items-center mt-6 gap-4">
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={loading}
                        className="text-transform-none"
                        sx={{
                            minWidth: "150px",
                            height: "40px",
                            backgroundColor: "#FFFFFF",
                            borderColor: "#F6692F",
                            color: "#F6692F",
                            "&:hover": {
                                backgroundColor: "#FFF5E5",
                                borderColor: "#FF8C00",
                                color: "#FF8C00",
                            },
                            fontFamily: "Open Sans",
                            
                            fontWeight: "bold",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDelete}
                        disabled={loading}
                        className="text-transform-none"
                        sx={{
                            minWidth: "150px",
                            height: "40px",
                            background: "linear-gradient(to right, #f97316, #fdba74)",
                            color: "white",
                            fontWeight: "bold",
                            fontFamily: "Open Sans",
                            "&:hover": {
                                background: "linear-gradient(to right, #ea580c, #fca154)",
                            },
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={20} sx={{ color: "#fff" }} />
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </div>
            </Box>
        </Modal>
    );
};

export default DeleteRoleModal;
