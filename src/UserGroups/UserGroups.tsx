import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper } from '@material-ui/core';
import { fetchUserGroups, updateUserGroups } from '../DataServices/DataServices';
import DefaultTable from '../Table/Table';
import ChipCell, { MetadataChipCell } from '../Table/Cells/ChipCell';
import UserGroupTableHeader from './UserGroupsTableHeader';
import ActionsCell from '../Table/Cells/ActionsCell';
import Dialog from '../Table/Dialog';
import UserGroupForm from './UserGroupForm';

const UserGroups = ({ host, token, metadata }: UserGroupListProps) => {
  const [userGroups, setUserGroups] = useState<UserGroupsData[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setisEditing] = useState(false);
  const [selectedUserGroup, setSelectedUser] = useState<UserGroupsData>();

  const openDialog = () => {
    setIsDialogOpen(true);
    setisEditing(false);
  };

  const handleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  const handleChange = (name, value) => {
    setSelectedUser({
      ...selectedUserGroup,
      [name]: value,
    });
  };

  const onEdit = (item) => {
    setIsDialogOpen(true);
    setisEditing(true);
    setSelectedUser(item);
  };

  const onDelete = () => {
    console.log('onDelete');
    setIsDialogOpen(true);
  };

  const handleSubmit = (user) => {
    const newGroups = [...userGroups];

    for (const key in newGroups) {
      const group = newGroups[key];

      if (group.id === user.id) {
        newGroups[key] = user;
      }
    }

    setUserGroups(newGroups);

    setIsDialogOpen(false);

    return (
      updateUserGroups(host, token, {
        id: user.id,
        name: user.name,
        users: user.users,
        metadata: user.metadata,
      }).subscribe((user) => {
        getData();
      }),
      (error) => {
        console.log(error);
      }
    );
  };

  const metadataHeader = metadata
    ? metadata.reduce(
        (acc, cur) => [
          ...acc,
          {
            Header: cur.label,
            accessor: `metadata.${cur.key}`,
            Cell: MetadataChipCell(cur),
          },
        ],
        [],
      )
    : [];

  const columns = [
    {
      Header: 'ID',
      accessor: 'id',
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Users',
      accessor: 'users',
      Cell: ChipCell,
    },
  ];

  const actions = [
    {
      Header: 'Actions',
      accessor: 'action',
      Cell: ({
        cell: {
          value: [item],
        },
      }) => <ActionsCell item={item} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];

  const TableHeaders = useMemo(() => columns.concat(metadataHeader).concat(actions), []);

  const searchItems = (item: UserGroupsData) => {
    if (filter === '') return true;

    const query = filter.toLowerCase();
    const id = item.id.toLowerCase();
    const name = item.name.toLowerCase();
    const users = item.users.map((ug) => ug.toLowerCase());

    return id.includes(query) || name.includes(query) || users.some((ug) => ug.indexOf(query) >= 0);
  };

  const getData = () => {
    fetchUserGroups(host, token).subscribe(
      async (body: Record<any, any>) => {
        const userGroups = body as UserGroups[];

        setUserGroups(userGroups);
      },
      (error) => {
        setError(true);
        setLoading(false);

        console.error('UG Error: ', error);
      },
    );
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <Box>
        <Dialog
          dialogId="userGroups"
          title={isEditing ? 'Edit User Group Details' : 'Create New User Group'}
          message=""
          showDialog={isDialogOpen}
          onConfirm={handleDialog}
          onCancel={handleDialog}
        >
          <UserGroupForm
            onSubmit={handleSubmit}
            isEditing={isEditing}
            selectedUserGroup={selectedUserGroup}
            onChange={handleChange}
            onCancel={handleDialog}
            metadata={metadata}
          />
        </Dialog>

        <UserGroupTableHeader filter={filter} setFilter={setFilter} onNew={openDialog} />
        <Paper>
          <DefaultTable
            error={error}
            loading={loading}
            tableHeaders={TableHeaders}
            data={userGroups}
            searchItems={(item) => searchItems(item)}
          />
        </Paper>
      </Box>
    </>
  );
};

export default UserGroups;
