import React from 'react';
import { Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

const NavLinkCell = ({ cell, row }) => (
  <NavLink to={`/production/cutting/${row.values.id}`} className="text-truncate h-100 d-flex align-items-center">
    {cell.value || '-'}
  </NavLink>
);

const BadgeCell = ({ cell }) => <Badge bg="outline-primary">{cell.value}</Badge>;

export { NavLinkCell, BadgeCell };
