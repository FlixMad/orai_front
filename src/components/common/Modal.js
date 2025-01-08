import styled from "styled-components";

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    confirmText,
    cancelText,
    onConfirm,
    size = "default",
}) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()} size={size}>
                <ModalHeader>
                    <h2>{title}</h2>
                </ModalHeader>
                <ModalBody>{children}</ModalBody>
                {(confirmText || cancelText) && (
                    <ModalFooter>
                        {cancelText && (
                            <CancelButton onClick={onClose}>
                                {cancelText}
                            </CancelButton>
                        )}
                        {confirmText && (
                            <ConfirmButton onClick={onConfirm}>
                                {confirmText}
                            </ConfirmButton>
                        )}
                    </ModalFooter>
                )}
            </ModalContent>
        </ModalOverlay>
    );
};

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    padding: 24px;
    border-radius: 12px;
    min-width: ${({ size }) => {
        switch (size) {
            case "large":
                return "600px";
            case "small":
                return "300px";
            default:
                return "400px";
        }
    }};
    max-width: 90%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
    margin-bottom: 16px;

    h2 {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
    }
`;

const ModalBody = styled.div`
    margin-bottom: 24px;

    p {
        margin: 8px 0;
        color: ${({ theme }) => theme.colors.text2};
    }
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
`;

const Button = styled.button`
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.2s ease;
`;

const CancelButton = styled(Button)`
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text2};

    &:hover {
        background: ${({ theme }) => theme.colors.border};
    }
`;

const ConfirmButton = styled(Button)`
    background: ${({ theme }) => theme.colors.status3};
    color: white;

    &:hover {
        background: ${({ theme }) => theme.colors.status3}dd;
    }
`;

export default Modal;
