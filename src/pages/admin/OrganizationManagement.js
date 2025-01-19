import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { axiosInstance } from "../../configs/axios-config";
import { API_BASE_URL, CALENDAR } from "../../configs/host-config";

const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [departments, setDepartments] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      console.log("부서 정보 조회 시작");
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CALENDAR}/api/departments`
      );
      console.log("API 응답:", response.data);

      if (response.data.statusCode === 200) {
        const treeData = buildTreeData(response.data.result);
        console.log("변환된 트리 데이터:", treeData);
        setDepartments(response.data.result);

        // 최상위 항목들을 자동으로 펼치기
        const topLevelItems = response.data.result.filter(
          (item) => item.parentId === ""
        );
        const initialExpanded = {};
        topLevelItems.forEach((item) => {
          initialExpanded[item.departmentId] = true;
        });
        setExpandedItems(initialExpanded);
      }
    } catch (error) {
      console.error("부서 정보 조회 실패:", error);
    }
  };

  const buildTreeData = (items, parentId = "") => {
    console.log("buildTreeData 호출:", { items, parentId });
    const result = items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: buildTreeData(items, item.departmentId),
      }));
    console.log("buildTreeData 결과:", { parentId, result });
    return result;
  };

  const toggleExpand = (departmentId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [departmentId]: !prev[departmentId],
    }));
  };

  const handleDepartmentClick = (item) => {
    setSelectedDepartment(item);
    toggleExpand(item.departmentId);
  };

  const renderTreeItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.departmentId];
    const isSelected = selectedDepartment?.departmentId === item.departmentId;

    return (
      <div key={item.departmentId}>
        <TreeItem
          level={level}
          onClick={() => handleDepartmentClick(item)}
          isSelected={isSelected}
        >
          <ItemContent type={item.type}>
            <span>{item.departmentName}</span>
          </ItemContent>
        </TreeItem>
        {hasChildren && isExpanded && (
          <div>
            {item.children.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

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

  const handleEdit = () => {
    // TODO: 수정 로직 구현
    console.log("수정할 부서:", selectedDepartment);
  };

  const handleDelete = () => {
    // TODO: 삭제 로직 구현
    console.log("삭제할 부서:", selectedDepartment);
  };

  const handleCreateSubDepartment = () => {
    // TODO: 하위부서 생성 로직 구현
    console.log("상위부서:", selectedDepartment);
  };

  const canCreateSubDepartment =
    selectedDepartment?.type === "DIVISION" ||
    selectedDepartment?.type === "GROUP";

  return (
    <PageLayout>
      <SideMenu>
        <TreeMenu>
          {buildTreeData(departments).map((item) => renderTreeItem(item))}
        </TreeMenu>
      </SideMenu>
      <MainContent>
        <Header>
          <HeaderTitle>조직도</HeaderTitle>
        </Header>
        <ContentArea>
          {selectedDepartment ? (
            <DepartmentDetail>
              <DetailItem>
                <Label>부서 ID:</Label>
                <Value>{selectedDepartment.departmentId}</Value>
              </DetailItem>
              <DetailItem>
                <Label>부서명:</Label>
                <Value>{selectedDepartment.departmentName}</Value>
              </DetailItem>
              <DetailItem>
                <Label>부서 유형:</Label>
                <Value>{selectedDepartment.type}</Value>
              </DetailItem>
              <ButtonContainer>
                {canCreateSubDepartment && (
                  <ActionButton
                    onClick={handleCreateSubDepartment}
                    color="#2196F3"
                  >
                    하위부서 생성
                  </ActionButton>
                )}
                <ActionButton onClick={handleEdit} color="#4CAF50">
                  수정
                </ActionButton>
                <ActionButton onClick={handleDelete} color="#f44336">
                  삭제
                </ActionButton>
              </ButtonContainer>
            </DepartmentDetail>
          ) : (
            <EmptyMessage>좌측에서 부서를 선택해주세요.</EmptyMessage>
          )}
        </ContentArea>
      </MainContent>
    </PageLayout>
  );
};

const PageLayout = styled.div`
  display: flex;
  height: 100vh;
`;

const SideMenu = styled.div`
  width: 200px;
  background-color: #f9f9f9;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px;
  font-size: 12px;
`;

const TreeMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
`;

const TreeItem = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 8px;
  padding-left: ${(props) => props.level * 20}px;
  cursor: pointer;
  font-size: 12px;
  background-color: ${(props) =>
    props.isSelected ? "#e3e3e3" : "transparent"};
  border-radius: 4px;
  position: relative;

  &:hover {
    background-color: #f0f0f0;
  }

  ${({ level }) =>
    level > 0 &&
    `
    &::before {
      content: '';
      position: absolute;
      left: ${(level - 1) * 20 + 8}px;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: ${({ theme }) => theme.colors.border};
      transform: translateY(-50%);
      height: 200%;
    }

    &::after {
      content: '';
      position: absolute;
      left: ${(level - 1) * 20 + 8}px;
      top: 50%;
      width: 12px;
      height: 2px;
      background-color: ${({ theme }) => theme.colors.border};
    }
  `}
`;

const ItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  width: 100%;

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: ${(props) =>
      props.type === "DIVISION"
        ? "600"
        : props.type === "GROUP"
        ? "500"
        : "normal"};
    color: ${(props) =>
      props.type === "DIVISION"
        ? "#2c3e50"
        : props.type === "GROUP"
        ? "#34495e"
        : "#7f8c8d"};
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 12px;
  background-color: white;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.2em;
  color: #333;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 24px;
  background-color: #f9f9f9;
  overflow-y: auto;
`;

const DepartmentDetail = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 12px;
  font-size: 13px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  font-weight: 600;
  width: 100px;
  color: ${({ theme }) => theme.colors.text2};
`;

const Value = styled.span`
  flex: 1;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text2};
  padding: 40px;
  font-size: 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 6px 16px;
  background-color: ${(props) => props.color};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export default OrganizationManagement;
