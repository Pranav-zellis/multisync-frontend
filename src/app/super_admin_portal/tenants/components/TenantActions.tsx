"use client";

import React, { useState } from "react";
import { Menu, MenuItem, Box, Icon } from "@mui/material";

interface TenantActionsMenuProps {
  schema: string;
}

const TenantActionsMenu: React.FC<TenantActionsMenuProps> = ({ schema }) => {
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
        console.log("Create Admin for:", schema);
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
          add_circle
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
          Create New Regular User
        </MenuItem>
        <MenuItem onClick={() => handleActionClick("attachAdmin")}>
          Attach existing admin to Tenant
        </MenuItem>
        <MenuItem onClick={() => handleActionClick("attachUser")}>
          Attach existing regular user to Tenant
        </MenuItem>
      </Menu>
    </>
  );

};

export default TenantActionsMenu;
