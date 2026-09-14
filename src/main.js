import "./style.css";

import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";

import {
    TYPES,
    GROUPS
} from "./config.js";

import {
    setGraph,
    focusCharacter,
    setCompareMode,
    clearSelection
} from "./graph.js";

cytoscape.use(dagre);


async function start() {

    /* =========================
    ЗАВАНТАЖЕННЯ ДАНИХ
    ========================= */

    const response =
        await fetch(
            `${import.meta.env.BASE_URL}mythology.json`
        );

    if (!response.ok) {
        throw new Error(
            `Не вдалося завантажити mythology.json: ${response.status}`
        );
    }

    const data =
        await response.json();


    /* =========================
    ВУЗЛИ ПЕРСОНАЖІВ
    ========================= */

    const characterNodes =
        data.characters.map(
            (character) => ({
                data: {
                    id:
                        character.id,

                    label:
                        character.name,

                    type:
                        character.type,

                    group:
                        character.group,

                    power:
                        character.power,

                    kind:
                        "character"
                }
            })
        );


    /* =========================
    ВУЗЛИ СТОСУНКІВ
    ========================= */

    const relationshipNodes =
        data.relationships.map(
            (relationship) => ({
                data: {
                    id:
                        `relationship-${relationship.id}`,

                    kind:
                        "relationship"
                },

                classes:
                    "relationship-node"
            })
        );


    /* =========================
    РЕБРА
    ========================= */

    const edges = [];

    data.relationships.forEach(
        (relationship) => {

            const relationshipNodeId =
                `relationship-${relationship.id}`;


            /* =====================
            ПАРТНЕРИ
            ===================== */

            relationship.partners.forEach(
                (partnerId) => {

                    edges.push({
                        data: {
                            id:
                                `${partnerId}-${relationshipNodeId}`,

                            source:
                                partnerId,

                            target:
                                relationshipNodeId
                        },

                        classes:
                            "relationship-edge"
                    });
                }
            );


            /* =====================
            ДІТИ
            ===================== */

            data.characters
                .filter(
                    (character) =>
                        character.relationship ===
                        relationship.id
                )
                .forEach(
                    (child) => {

                        edges.push({
                            data: {
                                id:
                                    `${relationshipNodeId}-${child.id}`,

                                source:
                                    relationshipNodeId,

                                target:
                                    child.id
                            },

                            classes:
                                "child-edge"
                        });
                    }
                );
        }
    );


    /* =========================
    КОЛЬОРИ ВУЗЛІВ
    ========================= */

    const nodeStyles = [];

    Object.entries(
        TYPES
    ).forEach(
        ([type]) => {

            Object.entries(
                GROUPS
            ).forEach(
                ([group, shades]) => {

                    for (
                        let power = 1;
                        power <= 5;
                        power++
                    ) {

                        nodeStyles.push({
                            selector:
                                `node[type="${type}"]` +
                                `[group="${group}"]` +
                                `[power="${power}"]`,

                            style: {
                                "background-color":
                                    shades[power]
                            }
                        });
                    }
                }
            );
        }
    );


    /* =========================
    CYTOSCAPE
    ========================= */

    const cy =
        cytoscape({

            container:
                document.getElementById(
                    "cy"
                ),

            elements: [
                ...characterNodes,
                ...relationshipNodes,
                ...edges
            ],

            style: [

                /* =====================
                ПЕРСОНАЖ
                ===================== */

                {
                    selector:
                        'node[kind="character"]',

                    style: {

                        label:
                            "data(label)",

                        shape:
                            "round-rectangle",

                        width:
                            170,

                        height:
                            75,

                        "background-color":
                            "#F3EBDD",

                        "border-width":
                            2,

                        "border-color":
                            "#B89B5E",

                        color:
                            "#2B2B2B",

                        "font-size":
                            18,

                        "font-weight":
                            "bold",

                        "text-valign":
                            "center",

                        "text-halign":
                            "center",

                        "text-wrap":
                            "wrap",

                        "text-max-width":
                            145
                    }
                },


                ...nodeStyles,


                /* =====================
                ВУЗОЛ СТОСУНКУ
                ===================== */

                {
                    selector:
                        ".relationship-node",

                    style: {

                        label:
                            "",

                        shape:
                            "ellipse",

                        width:
                            10,

                        height:
                            10,

                        "background-color":
                            "#B89B5E",

                        "border-width":
                            1,

                        "border-color":
                            "#8C6A2F",

                        opacity:
                            0.9
                    }
                },


                /* =====================
                ВИБРАНИЙ ПЕРСОНАЖ
                ===================== */

                {
                    selector:
                        'node[kind="character"]:selected',

                    style: {

                        "border-width":
                            5,

                        "border-color":
                            "#8C6A2F",

                        "overlay-opacity":
                            0
                    }
                },


                /* =====================
                ЗВИЧАЙНІ ПРЕДКИ
                ===================== */

                {
                    selector:
                        ".ancestor",

                    style: {

                        "background-color":
                            "#FFE39A",

                        "border-color":
                            "#C28A00",

                        "border-width":
                            4
                    }
                },


                /* =====================
                ЗВИЧАЙНІ РЕБРА
                ===================== */

                {
                    selector:
                        "edge",

                    style: {

                        width:
                            2,

                        "line-color":
                            "#AAA39A",

                        "curve-style":
                            "straight",

                        "target-arrow-shape":
                            "none",

                        opacity:
                            0.8
                    }
                },


                /* =====================
                РЕБРА СТОСУНКІВ
                ===================== */

                {
                    selector:
                        ".relationship-edge",

                    style: {

                        width:
                            3,

                        "line-color":
                            "#B89B5E",

                        "curve-style":
                            "straight",

                        "line-style":
                            "solid",

                        opacity:
                            0.95
                    }
                },


                /* =====================
                РЕБРА ДІТЕЙ
                ===================== */

                {
                    selector:
                        ".child-edge",

                    style: {

                        width:
                            2,

                        "line-color":
                            "#9C958B",

                        "curve-style":
                            "straight",

                        "line-style":
                            "solid",

                        opacity:
                            0.8
                    }
                },


                /* =====================
                ПРЕДКИ — РЕБРА
                ===================== */

                {
                    selector:
                        "edge.ancestor",

                    style: {

                        "line-color":
                            "#C28A00",

                        width:
                            4,

                        opacity:
                            1
                    }
                },


                /* =====================
                ПОРІВНЯННЯ — ПЕРШИЙ
                ===================== */

                {
                    selector:
                        "node.compare-first",

                    style: {

                        "background-color":
                            "#FFE39A",

                        "border-color":
                            "#C28A00",

                        "border-width":
                            4
                    }
                },


                /* =====================
                ПОРІВНЯННЯ — ДРУГИЙ
                ===================== */

                {
                    selector:
                        "node.compare-second",

                    style: {

                        "background-color":
                            "#BFD9FF",

                        "border-color":
                            "#4F8BFF",

                        "border-width":
                            4
                    }
                },


                /* =====================
                ПОРІВНЯННЯ — СПІЛЬНІ
                ===================== */

                {
                    selector:
                        "node.compare-common",

                    style: {

                        "background-color":
                            "#BFE8C5",

                        "border-color":
                            "#3F8F4D",

                        "border-width":
                            4
                    }
                },


                /* =====================
                РЕБРА ПЕРШОГО
                ===================== */

                {
                    selector:
                        "edge.compare-first",

                    style: {

                        "line-color":
                            "#C28A00",

                        width:
                            4,

                        opacity:
                            1
                    }
                },


                /* =====================
                РЕБРА ДРУГОГО
                ===================== */

                {
                    selector:
                        "edge.compare-second",

                    style: {

                        "line-color":
                            "#4F8BFF",

                        width:
                            4,

                        opacity:
                            1
                    }
                },


                /* =====================
                СПІЛЬНІ РЕБРА
                ===================== */

                {
                    selector:
                        "edge.compare-common",

                    style: {

                        "line-color":
                            "#3F8F4D",

                        width:
                            4,

                        opacity:
                            1
                    }
                }
            ],


            /* =========================
            LAYOUT
            ========================= */

            layout: {

                name:
                    "dagre",

                rankDir:
                    "TB",

                nodeSep:
                    85,

                rankSep:
                    170,

                edgeSep:
                    25,

                ranker:
                    "network-simplex",

                animate:
                    false,

                fit:
                    true,

                padding:
                    80
            }
        });


    /* =========================
    ЗАБОРОНА ПЕРЕТЯГУВАННЯ
    ========================= */

    cy.nodes()
        .ungrabify();


    /* =========================
    ПЕРЕДАЄМО ГРАФ У GRAPH.JS
    ========================= */

    setGraph(
        cy,
        data
    );


    /* =========================
    КЛІК ПО ПЕРСОНАЖУ
    ========================= */

    cy.on(
        "tap",
        'node[kind="character"]',
        (event) => {

            focusCharacter(
                event.target.id()
            );
        }
    );


    /* =========================
    КЛІК ПО ПОРОЖНЬОМУ МІСЦЮ
    ========================= */

    cy.on(
        "tap",
        (event) => {

            if (
                event.target !== cy
            ) {
                return;
            }

            clearSelection();
        }
    );


    /* =========================
    ПОШУК
    ========================= */

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const searchResults =
        document.getElementById(
            "searchResults"
        );


    searchInput.addEventListener(
        "input",
        () => {

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();

            searchResults.innerHTML =
                "";


            if (
                query === ""
            ) {
                return;
            }


            const matches =
                data.characters.filter(
                    (character) =>
                        character.name
                            .toLowerCase()
                            .includes(
                                query
                            )
                );


            if (
                matches.length === 0
            ) {

                const message =
                    document.createElement(
                        "div"
                    );

                message.className =
                    "no-results";

                message.textContent =
                    "Нічого не знайдено";

                searchResults.appendChild(
                    message
                );

                return;
            }


            matches.forEach(
                (character) => {

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "search-result";

                    button.textContent =
                        character.name;


                    button.addEventListener(
                        "click",
                        () => {

                            focusCharacter(
                                character.id
                            );

                            searchInput.value =
                                "";

                            searchResults.innerHTML =
                                "";
                        }
                    );


                    searchResults.appendChild(
                        button
                    );
                }
            );
        }
    );


    /* =========================
    КНОПКИ
    ========================= */

    const zoomInButton =
        document.getElementById(
            "zoomInButton"
        );

    const zoomOutButton =
        document.getElementById(
            "zoomOutButton"
        );

    const fitButton =
        document.getElementById(
            "fitButton"
        );

    const compareButton =
        document.getElementById(
            "compareButton"
        );


    /* =========================
    ЗБІЛЬШЕННЯ
    ========================= */

    zoomInButton.addEventListener(
        "click",
        () => {

            cy.zoom({
                level:
                    cy.zoom() * 1.2,

                renderedPosition: {
                    x:
                        cy.width() / 2,

                    y:
                        cy.height() / 2
                }
            });
        }
    );


    /* =========================
    ЗМЕНШЕННЯ
    ========================= */

    zoomOutButton.addEventListener(
        "click",
        () => {

            cy.zoom({
                level:
                    cy.zoom() / 1.2,

                renderedPosition: {
                    x:
                        cy.width() / 2,

                    y:
                        cy.height() / 2
                }
            });
        }
    );


    /* =========================
    FIT
    ========================= */

    fitButton.addEventListener(
        "click",
        () => {

            cy.fit(
                cy.elements(),
                80
            );
        }
    );


    /* =========================
    РЕЖИМ ПОРІВНЯННЯ
    ========================= */

    if (
        compareButton
    ) {

        compareButton.addEventListener(
            "click",
            () => {

                const active =
                    !compareButton.classList.contains(
                        "compare-active"
                    );


                compareButton.classList.toggle(
                    "compare-active",
                    active
                );


                setCompareMode(
                    active
                );


                if (
                    !active
                ) {
                    clearSelection();
                }
            }
        );
    }


    /* =========================
    ІНФОРМАЦІЙНА ПАНЕЛЬ
    ========================= */

    const info =
        document.getElementById(
            "info"
        );


    /* =========================
    ПОЗИЦІЯ КНОПОК
    ========================= */

    function updateInitialControlsPosition() {

        if (
            !info ||
            window.innerWidth > 768
        ) {
            return;
        }


        const controls =
            document.getElementById(
                "controls"
            );


        if (!controls) {
            return;
        }


        if (
            info.classList.contains(
                "info-closed"
            )
        ) {

            controls.style.bottom =
                "20px";

            return;
        }


        const panelHeight =
            info.getBoundingClientRect()
                .height;


        controls.style.bottom =
            `${panelHeight + 14}px`;
    }


    requestAnimationFrame(
        updateInitialControlsPosition
    );


    window.addEventListener(
        "resize",
        updateInitialControlsPosition
    );
}


/* =========================
ЗАПУСК
========================= */

start().catch(
    (error) => {

        console.error(
            "Помилка запуску:",
            error
        );
    }
);