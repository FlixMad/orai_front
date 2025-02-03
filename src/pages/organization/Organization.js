import styled from "styled-components";
import { useEffect, useState, useRef } from "react";
import Mermaid from "mermaid";
import Panzoom from "@panzoom/panzoom";
import { API_BASE_URL, CALENDAR } from "../../configs/host-config";
import { axiosInstance } from "../../configs/axios-config";

const Organization = () => {
    const [departments, setDepartments] = useState([]);
    const chartRef = useRef(null);
    const panzoomRef = useRef(null);

    useEffect(() => {
        const initPanzoom = () => {
            if (chartRef.current && !panzoomRef.current) {
                const element = chartRef.current;
                panzoomRef.current = Panzoom(element, {
                    maxScale: 2,
                    minScale: 0.5,
                    startScale: 0.9,
                    startX: 170,
                    startY: 0,
                });

                // 휠 이벤트 처리
                element.addEventListener(
                    "wheel",
                    panzoomRef.current.zoomWithWheel
                );
            }
        };

        const renderChart = async () => {
            try {
                await Mermaid.initialize({
                    startOnLoad: false,
                    theme: "default",
                    securityLevel: "loose",
                    flowchart: {
                        htmlLabels: true,
                        curve: "basis",
                    },
                });

                const response = await axiosInstance.get(
                    `${API_BASE_URL}${CALENDAR}/api/departments`
                );
                const data = response.data;

                if (data.statusCode === 200) {
                    setDepartments(data.result);
                    const mermaidDefinition = generateMermaidDefinition(
                        data.result
                    );
                    const element = document.querySelector("#orgChart");

                    if (element) {
                        const { svg } = await Mermaid.render(
                            "orgChart-" + Date.now(),
                            mermaidDefinition
                        );
                        element.innerHTML = svg;
                        setTimeout(initPanzoom, 100);
                    }
                }
            } catch (error) {
                console.error("조직도 렌더링 실패:", error);
            }
        };

        renderChart();

        return () => {
            if (panzoomRef.current) {
                panzoomRef.current.destroy();
            }
        };
    }, []);

    const generateMermaidDefinition = (departments) => {
        let definition = `
            flowchart TD
            %% 방향 설정
            direction TB
            
            %% 스타일 클래스 정의
            classDef root fill:#122B1D,color:#fff,stroke:#122B1D,stroke-width:2px
            classDef division fill:#537E72,color:#fff,stroke:#537E72,stroke-width:1px
            classDef group fill:#9CC97F,color:#fff,stroke:#9CC97F,stroke-width:1px
            classDef team fill:#90B7BF,color:#fff,stroke:#90B7BF,stroke-width:1px
            
            %% 루트 노드
            root["<div class='node-content root-node'>
                <div class='title'>Charlie's Factory</div>
                <div class='subtitle'>전체 조직도</div>
            </div>"]:::root
            
            %% 링크 스타일
            linkStyle default stroke:#CDDECB,stroke-width:2px
        `;

        // 최상위 부서 (DIVISION)
        departments
            .filter((dept) => dept.parentId === "")
            .forEach((dept) => {
                definition += `
                    ${dept.departmentId}["<div class='node-content division-node'>
                        <div class='title'>${dept.departmentName}</div>
                        <div class='type'>DIVISION</div>
                    </div>"]:::division
                    root --> ${dept.departmentId}
                `;
            });

        // GROUP 부서
        departments
            .filter((dept) => dept.type === "GROUP")
            .forEach((dept) => {
                definition += `
                    ${dept.departmentId}["<div class='node-content group-node'>
                        <div class='title'>${dept.departmentName}</div>
                        <div class='type'>GROUP</div>
                    </div>"]:::group
                    ${dept.parentId} --> ${dept.departmentId}
                `;
            });

        // TEAM 부서
        departments
            .filter((dept) => dept.type === "TEAM")
            .forEach((dept) => {
                definition += `
                    ${dept.departmentId}["<div class='node-content team-node'>
                        <div class='title'>${dept.departmentName}</div>
                        <div class='type'>TEAM</div>
                    </div>"]:::team
                    ${dept.parentId} --> ${dept.departmentId}
                `;
            });

        return definition;
    };

    const nodeStyles = `
        .node-content {
            padding: 32px;
            border-radius: 16px;
            min-width: 400px;
            text-align: center;
        }
        .node-content .title {
            font-weight: 700;
            font-size: 28px;
            margin-bottom: 12px;
        }
        .node-content .subtitle,
        .node-content .type {
            font-size: 20px;
            opacity: 0.9;
            font-weight: 500;
        }
        .root-node {
            background: #122B1D;
            color: white;
            padding: 40px;

            .title {
                font-size: 34px;
                margin-bottom: 16px;
            }
            .subtitle {
                font-size: 24px;
            }
        }
        .division-node {
            background: #537E72;
            color: white;
        }
        .group-node {
            background: #9CC97F;
            color: white;
        }
        .team-node {
            background: #90B7BF;
            color: white;
        }
    `;

    return (
        <Container>
            <ChartContainer>
                <ChartWrapper ref={chartRef}>
                    <div id="orgChart" />
                </ChartWrapper>
            </ChartContainer>
            <style>{nodeStyles}</style>
        </Container>
    );
};

const Container = styled.div`
    padding: 24px;
    height: 100%;
    background: white;
    position: relative;
`;

const ChartContainer = styled.div`
    width: 100%;
    height: calc(100vh - 100px);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    background: ${({ theme }) => theme.colors.background2};
`;

const ChartWrapper = styled.div`
    background: ${({ theme }) => theme.colors.background};
    padding: 100px;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    #orgChart {
        min-width: 2000px;
        min-height: 1500px;

        svg {
            width: 100%;
            height: 100%;
            min-height: 1500px;
        }

        .flowchart-link {
            stroke-width: 4px;
        }

        .node {
            margin: 40px 0;
        }
    }
`;

export default Organization;
