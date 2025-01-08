import React, { useState } from "react";
import styled from "styled-components";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddOrganization = () => {
    setOrganizations([...organizations, { ...formData, id: Date.now() }]);
    setFormData({ name: "", description: "" });
  };

  const handleEditOrganization = (id) => {
    const org = organizations.find((org) => org.id === id);
    setSelectedOrg(org);
    setFormData({ name: org.name, description: org.description });
  };

  const handleUpdateOrganization = () => {
    setOrganizations(
      organizations.map((org) =>
        org.id === selectedOrg.id ? { ...selectedOrg, ...formData } : org
      )
    );
    setSelectedOrg(null);
    setFormData({ name: "", description: "" });
  };

  const handleDeleteOrganization = (id) => {
    setOrganizations(organizations.filter((org) => org.id !== id));
  };

  return (
    <Container>
      <Header>조직 관리</Header>
      <Form>
        <Input
          type="text"
          name="name"
          placeholder="조직 이름"
          value={formData.name}
          onChange={handleInputChange}
        />
        <Input
          type="text"
          name="description"
          placeholder="조직 설명"
          value={formData.description}
          onChange={handleInputChange}
        />
        {selectedOrg ? (
          <Button onClick={handleUpdateOrganization}>수정</Button>
        ) : (
          <Button onClick={handleAddOrganization}>추가</Button>
        )}
      </Form>
      <OrganizationList>
        {organizations.map((org) => (
          <OrganizationItem key={org.id}>
            <span>{org.name}</span>
            <span>{org.description}</span>
            <IconButton onClick={() => handleEditOrganization(org.id)}>
              <FaEdit />
            </IconButton>
            <IconButton onClick={() => handleDeleteOrganization(org.id)}>
              <FaTrash />
            </IconButton>
          </OrganizationItem>
        ))}
      </OrganizationList>
    </Container>
  );
};

const Container = styled.div`
  padding: 24px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h2`
  margin-bottom: 16px;
`;

const Form = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary1};
  }
`;

const OrganizationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OrganizationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text2};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default OrganizationManagement;
