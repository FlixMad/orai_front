import React, { useState, useEffect } from "react";
import styled, { useTheme } from "styled-components";
import { axiosInstance } from "../../configs/axios-config";
import { API_BASE_URL, CALENDAR } from "../../configs/host-config";

// 모달 컴포넌트 추가
const ConfirmModal = ({ isOpen, onRequestClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <ModalOverlay>
            <ModalContent>
                <p>정말 삭제하시겠습니까?</p>
                <ButtonContainer>
                    <ActionButton onClick={onConfirm} color="#f44336">
                        확인
                    </ActionButton>
                    <ActionButton onClick={onRequestClose} color="#9e9e9e">
                        취소
                    </ActionButton>
                </ButtonContainer>
            </ModalContent>
        </ModalOverlay>
    );
};

const OrganizationManagement = () => {
    const theme = useTheme();
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [departments, setDepartments] = useState([]);
    const [expandedItems, setExpandedItems] = useState({});
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        departmentName: "",
        type: "",
    });
    const [isCreatingSubDepartment, setIsCreatingSubDepartment] =
        useState(false);
    const [newSubDepartmentData, setNewSubDepartmentData] = useState({
        departmentName: "",
        type: "TEAM", // 기본값 설정
    });
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axiosInstance.get(
                `${API_BASE_URL}${CALENDAR}/api/departments`
            );

            if (response.data.statusCode === 200) {
                const treeData = buildTreeData(response.data.result);
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
        const result = items
            .filter((item) => item.parentId === parentId)
            .map((item) => ({
                ...item,
                children: buildTreeData(items, item.departmentId),
            }));
        return result;
    };

    const toggleExpand = (departmentId) => {
        setExpandedItems((prev) => ({
            ...prev,
            [departmentId]: !prev[departmentId],
        }));
    };

    const handleDepartmentClick = (item) => {
        if (isEditing || isCreatingSubDepartment) return; // 수정 또는 생성 모드일 때는 부서 선택을 막음
        setSelectedDepartment(item);
        toggleExpand(item.departmentId);
    };

    const renderTreeItem = (item, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems[item.departmentId];
        const isSelected =
            selectedDepartment?.departmentId === item.departmentId;

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
                        {item.children.map((child) =>
                            renderTreeItem(child, level + 1)
                        )}
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
                org.id === selectedOrg.id
                    ? { ...selectedOrg, ...formData }
                    : org
            )
        );
        setSelectedOrg(null);
        setFormData({ name: "", description: "" });
    };

    const handleDeleteOrganization = (id) => {
        setOrganizations(organizations.filter((org) => org.id !== id));
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditFormData({
            departmentName: selectedDepartment.departmentName,
            type: selectedDepartment.type,
        });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const response = await axiosInstance.patch(
                `${API_BASE_URL}${CALENDAR}/api/departments/${selectedDepartment.departmentId}`,
                {
                    name: editFormData.departmentName,
                }
            );

            if (response.status === 200) {
                // 성공적으로 수정되면 부서 목록을 다시 불러옴
                await fetchDepartments();
                // 새로 불러온 departments에서 현재 선택된 부서를 찾아 업데이트
                const updatedDepartment = departments.find(
                    (dept) =>
                        dept.departmentId === selectedDepartment.departmentId
                );
                if (updatedDepartment) {
                    setSelectedDepartment(updatedDepartment);
                }
                setIsEditing(false); // 수정 모드 종료
            } else {
                console.error("API 요청 실패:", response.data);
            }
        } catch (error) {
            console.error("부서 수정 실패:", error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditFormData({
            departmentName: "",
            type: "",
        });
    };

    const handleDelete = () => {
        setIsModalOpen(true); // 모달 열기
    };

    const confirmDelete = async () => {
        try {
            const response = await axiosInstance.delete(
                `${API_BASE_URL}${CALENDAR}/api/departments/${selectedDepartment.departmentId}`
            );

            if (response.status === 204) {
                // 성공적으로 삭제되면 부서 목록을 다시 불러옴
                await fetchDepartments();
                setSelectedDepartment(null);
            } else {
                console.error("부서 삭제 실패:", response.data);
            }
        } catch (error) {
            console.error("부서 삭제 중 오류 발생:", error);
        } finally {
            setIsModalOpen(false); // 모달 닫기
        }
    };

    const handleCreateSubDepartment = () => {
        setIsCreatingSubDepartment(true);
        // 상위 부서 유형에 따라 하위 부서 유형을 설정
        let subDepartmentType = "TEAM"; // 기본값
        if (selectedDepartment.type === "DIVISION") {
            subDepartmentType = "GROUP";
        } else if (selectedDepartment.type === "GROUP") {
            subDepartmentType = "TEAM";
        }
        setNewSubDepartmentData({
            departmentName: "",
            type: subDepartmentType,
        });
    };

    const handleNewSubDepartmentInputChange = (e) => {
        const { name, value } = e.target;
        setNewSubDepartmentData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveNewSubDepartment = async () => {
        try {
            const response = await axiosInstance.post(
                `${API_BASE_URL}${CALENDAR}/api/departments`,
                {
                    name: newSubDepartmentData.departmentName,
                    parent: selectedDepartment.departmentId,
                    type: newSubDepartmentData.type,
                }
            );

            if (response.status === 200) {
                // 성공적으로 생성되면 부서 목록을 다시 불러옴
                await fetchDepartments();
                setIsCreatingSubDepartment(false);
            } else {
                console.error("하위부서 생성 실패:", response.data);
            }
        } catch (error) {
            console.error("하위부서 생성 중 오류 발생:", error);
        }
    };

    const handleCancelNewSubDepartment = () => {
        setIsCreatingSubDepartment(false);
        setNewSubDepartmentData({
            departmentName: "",
            type: "TEAM",
        });
    };

    const canCreateSubDepartment =
        selectedDepartment?.type === "DIVISION" ||
        selectedDepartment?.type === "GROUP";

    return (
        <PageLayout>
            <SideMenu>
                <TreeMenu>
                    {buildTreeData(departments).map((item) =>
                        renderTreeItem(item)
                    )}
                </TreeMenu>
            </SideMenu>
            <MainContent>
                <Header>
                    <HeaderTitle>조직도</HeaderTitle>
                </Header>
                <ContentArea>
                    {isCreatingSubDepartment ? (
                        <DepartmentDetail>
                            <DetailItem>
                                <Label>부서명:</Label>
                                <EditInput
                                    name="departmentName"
                                    value={newSubDepartmentData.departmentName}
                                    onChange={handleNewSubDepartmentInputChange}
                                />
                            </DetailItem>
                            <DetailItem>
                                <Label>부서 유형:</Label>
                                <Value>{newSubDepartmentData.type}</Value>
                            </DetailItem>
                            <ButtonContainer>
                                <ActionButton
                                    onClick={handleSaveNewSubDepartment}
                                    color={theme.colors.status1}
                                >
                                    저장
                                </ActionButton>
                                <ActionButton
                                    onClick={handleCancelNewSubDepartment}
                                    color={theme.colors.secondary1}
                                >
                                    취소
                                </ActionButton>
                            </ButtonContainer>
                        </DepartmentDetail>
                    ) : selectedDepartment ? (
                        <DepartmentDetail>
                            {isEditing ? (
                                <>
                                    <DetailItem>
                                        <Label>부서 ID:</Label>
                                        <Value>
                                            {selectedDepartment.departmentId}
                                        </Value>
                                    </DetailItem>
                                    <DetailItem>
                                        <Label>부서명:</Label>
                                        <EditInput
                                            name="departmentName"
                                            value={editFormData.departmentName}
                                            onChange={handleEditInputChange}
                                        />
                                    </DetailItem>
                                    <DetailItem>
                                        <Label>부서 유형:</Label>
                                        <Value>{selectedDepartment.type}</Value>
                                    </DetailItem>
                                    <ButtonContainer>
                                        <ActionButton
                                            onClick={handleSave}
                                            color={theme.colors.status1}
                                        >
                                            저장
                                        </ActionButton>
                                        <ActionButton
                                            onClick={handleCancel}
                                            color={theme.colors.secondary1}
                                        >
                                            취소
                                        </ActionButton>
                                    </ButtonContainer>
                                </>
                            ) : (
                                <>
                                    <DetailItem>
                                        <Label>부서 ID:</Label>
                                        <Value>
                                            {selectedDepartment.departmentId}
                                        </Value>
                                    </DetailItem>
                                    <DetailItem>
                                        <Label>부서명:</Label>
                                        <Value>
                                            {selectedDepartment.departmentName}
                                        </Value>
                                    </DetailItem>
                                    <DetailItem>
                                        <Label>부서 유형:</Label>
                                        <Value>{selectedDepartment.type}</Value>
                                    </DetailItem>
                                    <ButtonContainer>
                                        {canCreateSubDepartment && (
                                            <ActionButton
                                                onClick={
                                                    handleCreateSubDepartment
                                                }
                                                color={theme.colors.secondary2}
                                            >
                                                하위부서 생성
                                            </ActionButton>
                                        )}
                                        <ActionButton
                                            onClick={handleEdit}
                                            color={theme.colors.primary}
                                        >
                                            수정
                                        </ActionButton>
                                        <ActionButton
                                            onClick={handleDelete}
                                            color={theme.colors.status3}
                                        >
                                            삭제
                                        </ActionButton>
                                    </ButtonContainer>
                                </>
                            )}
                        </DepartmentDetail>
                    ) : (
                        <EmptyMessage>
                            좌측에서 부서를 선택해주세요.
                        </EmptyMessage>
                    )}
                </ContentArea>
            </MainContent>
            <ConfirmModal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
            />
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
    background-color: ${(props) => props.color || props.theme.colors.primary};
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

const EditInput = styled.input`
    flex: 1;
    padding: 4px 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    font-size: 13px;
`;

const EditSelect = styled.select`
    flex: 1;
    padding: 4px 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    font-size: 13px;
`;

// 모달 스타일 컴포넌트 추가
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    width: 300px;
    text-align: center;
`;

export default OrganizationManagement;
