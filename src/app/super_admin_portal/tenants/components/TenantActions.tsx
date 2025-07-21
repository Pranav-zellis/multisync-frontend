"use client";

import React, { useState } from "react";
import { Menu, MenuItem, Box, Icon } from "@mui/material";

interface TenantActionsMenuProps {
  schema: string;
  tenantName: string;
  onCreateAdmin: (schema: string, tenantName: string) => void;
}

const TenantActionsMenu: React.FC<TenantActionsMenuProps> = ({
  schema,
  tenantName,
  onCreateAdmin,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: string) => {
    handleMenuClose();

    switch (action) {
      case "createAdmin":
        onCreateAdmin(schema, tenantName); // ✅ pass both
        break;
      case "createUser":
        console.log("Create User for:", schema);
        break;
      case "attachAdmin":
        console.log("Attach Existing Admin:", schema);
        break;
      case "attachUser":
        console.log("Attach Existing User:", schema);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="100%"
        height="100%"
      >
        <Icon
          className="material-symbols-outlined"
          style={{ cursor: "pointer" }}
          onClick={handleMenuOpen}
        >
          more_vert
        </Icon>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleActionClick("createAdmin")}>
          Create New Admin User
        </MenuItem>
        <MenuItem onClick={() => handleActionClick("createUser")}>
          Create New User
        </MenuItem>
        <MenuItem onClick={() => handleActionClick("attachAdmin")}>
          Attach Existing Admin to Tenant
        </MenuItem>
        <MenuItem onClick={() => handleActionClick("attachUser")}>
          Attach Existing Regular User to Tenant
        </MenuItem>
      </Menu>
    </>
  );
};

export default TenantActionsMenu;
