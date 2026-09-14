import { showCharacter } from "./ui.js";

let cy = null;
let data = null;

let compareMode = false;
let compareFirst = null;
let compareSecond = null;


/* =========================
ВСТАНОВЛЕННЯ ГРАФА
========================= */

export function setGraph(
    graph,
    graphData
) {
    cy = graph;
    data = graphData;
}


/* =========================
ОЧИЩЕННЯ ПІДСВІЧУВАННЯ
========================= */

function clearHighlights() {
    if (!cy) {
        return;
    }

    cy.elements().removeClass(
        "ancestor"
    );

    cy.elements().removeClass(
        "compare-first"
    );

    cy.elements().removeClass(
        "compare-second"
    );

    cy.elements().removeClass(
        "compare-common"
    );
}


/* =========================
ОТРИМАТИ БАТЬКІВ ПЕРСОНАЖА
========================= */

function getParentIds(
    characterId
) {
    if (!data) {
        return [];
    }

    const character =
        data.characters.find(
            (item) =>
                item.id ===
                characterId
        );

    if (
        !character ||
        !character.relationship
    ) {
        return [];
    }

    const relationship =
        data.relationships.find(
            (item) =>
                item.id ===
                character.relationship
        );

    if (!relationship) {
        return [];
    }

    return relationship.partners;
}


/* =========================
ОТРИМАТИ ВСІХ ПРЕДКІВ
========================= */

function getAncestors(
    characterId
) {
    const ancestors =
        new Set();

    function walk(
        currentId
    ) {
        const parentIds =
            getParentIds(
                currentId
            );

        parentIds.forEach(
            (parentId) => {
                if (
                    ancestors.has(
                        parentId
                    )
                ) {
                    return;
                }

                ancestors.add(
                    parentId
                );

                walk(
                    parentId
                );
            }
        );
    }

    walk(
        characterId
    );

    return ancestors;
}


/* =========================
ОТРИМАТИ ВСІ ВУЗЛИ РОДОВОДУ
========================= */

function getLineageNodes(
    characterId
) {
    const ancestors =
        getAncestors(
            characterId
        );

    return new Set([
        characterId,
        ...ancestors
    ]);
}


/* =========================
ПІДСВІТИТИ ОДИН РІД
========================= */

function highlightLineage(
    characterId,
    className
) {
    if (!cy) {
        return new Set();
    }

    const lineage =
        getLineageNodes(
            characterId
        );

    lineage.forEach(
        (nodeId) => {
            const node =
                cy.getElementById(
                    nodeId
                );

            if (
                !node.empty()
            ) {
                node.addClass(
                    className
                );
            }
        }
    );

    /*
    Підсвічуємо реальні ребра,
    які належать цьому родоводу.
    */

    cy.edges().forEach(
        (edge) => {
            const sourceId =
                edge.source().id();

            const targetId =
                edge.target().id();

            /*
            Вузол relationship знаходиться
            між батьками та дитиною.
            */

            if (
                lineage.has(
                    sourceId
                ) ||
                lineage.has(
                    targetId
                )
            ) {
                edge.addClass(
                    className
                );
            }
        }
    );

    return lineage;
}


/* =========================
СПІЛЬНІ ПРЕДКИ
========================= */

function highlightCommonAncestors(
    firstLineage,
    secondLineage
) {
    if (!cy) {
        return;
    }

    const common =
        new Set();

    firstLineage.forEach(
        (nodeId) => {
            if (
                secondLineage.has(
                    nodeId
                )
            ) {
                common.add(
                    nodeId
                );
            }
        }
    );

    /*
    Спільні персонажі стають зеленими.
    */

    common.forEach(
        (nodeId) => {
            const node =
                cy.getElementById(
                    nodeId
                );

            if (
                node.empty()
            ) {
                return;
            }

            node.removeClass(
                "compare-first"
            );

            node.removeClass(
                "compare-second"
            );

            node.addClass(
                "compare-common"
            );
        }
    );

    /*
    Зеленими стають тільки ті ребра,
    які повністю належать спільній
    частині родоводу.
    */

    cy.edges().forEach(
        (edge) => {
            const sourceId =
                edge.source().id();

            const targetId =
                edge.target().id();

            if (
                common.has(
                    sourceId
                ) &&
                common.has(
                    targetId
                )
            ) {
                edge.removeClass(
                    "compare-first"
                );

                edge.removeClass(
                    "compare-second"
                );

                edge.addClass(
                    "compare-common"
                );
            }
        }
    );
}


/* =========================
ПОКАЗАТИ ПОРІВНЯННЯ
========================= */

function renderComparison() {
    if (
        !cy ||
        !compareFirst ||
        !compareSecond
    ) {
        return;
    }

    clearHighlights();

    const firstLineage =
        highlightLineage(
            compareFirst,
            "compare-first"
        );

    const secondLineage =
        highlightLineage(
            compareSecond,
            "compare-second"
        );

    highlightCommonAncestors(
        firstLineage,
        secondLineage
    );

    /*
    Самі обрані персонажі
    теж залишаються видимими.
    */

    const firstNode =
        cy.getElementById(
            compareFirst
        );

    const secondNode =
        cy.getElementById(
            compareSecond
        );

    if (
        !firstNode.empty()
    ) {
        firstNode.select();
    }

    if (
        !secondNode.empty()
    ) {
        secondNode.select();
    }
}


/* =========================
ВИБІР ПЕРСОНАЖА
В РЕЖИМІ ПОРІВНЯННЯ
========================= */

export function selectForComparison(
    id
) {
    if (
        !compareMode ||
        !cy ||
        !data
    ) {
        return;
    }

    const node =
        cy.getElementById(
            id
        );

    if (
        node.empty()
    ) {
        return;
    }

    /*
    Перший персонаж.
    */

    if (
        !compareFirst
    ) {
        compareFirst =
            id;

        compareSecond =
            null;

        cy.elements()
            .unselect();

        clearHighlights();

        node.select();

        highlightLineage(
            compareFirst,
            "compare-first"
        );

        showCharacterById(
            id
        );

        return;
    }

    /*
    Якщо натиснули першого
    ще раз — нічого не робимо.
    */

    if (
        id === compareFirst
    ) {
        return;
    }

    /*
    Другий персонаж.
    */

    if (
        !compareSecond
    ) {
        compareSecond =
            id;

        renderComparison();

        showCharacterById(
            id
        );

        return;
    }

    /*
    Якщо вже є два персонажі,
    новий клік замінює другого.
    */

    compareSecond =
        id;

    renderComparison();

    showCharacterById(
        id
    );
}


/* =========================
ПОКАЗ ПАНЕЛІ ПЕРСОНАЖА
========================= */

function showCharacterById(
    id
) {
    if (!data) {
        return;
    }

    const character =
        data.characters.find(
            (item) =>
                item.id ===
                id
        );

    if (!character) {
        return;
    }

    showCharacter(
        character,
        data,
        focusCharacter
    );
}


/* =========================
РЕЖИМ ПОРІВНЯННЯ
========================= */

export function setCompareMode(
    enabled
) {
    compareMode =
        enabled;

    compareFirst =
        null;

    compareSecond =
        null;

    clearHighlights();

    if (cy) {
        cy.elements()
            .unselect();
    }
}


/* =========================
СТАН РЕЖИМУ
========================= */

export function isCompareMode() {
    return compareMode;
}


/* =========================
ЗВИЧАЙНЕ ПІДСВІЧУВАННЯ ПРЕДКІВ
========================= */

function highlightAncestors(
    node
) {
    if (
        node.hasClass(
            "ancestor"
        )
    ) {
        return;
    }

    node.addClass(
        "ancestor"
    );

    if (
        node.data("kind") ===
        "character"
    ) {
        const character =
            data.characters.find(
                (item) =>
                    item.id ===
                    node.id()
            );

        if (
            !character?.relationship
        ) {
            return;
        }

        const relationshipNode =
            cy.getElementById(
                `relationship-${character.relationship}`
            );

        if (
            relationshipNode.empty()
        ) {
            return;
        }

        relationshipNode
            .incomers("edge")
            .forEach(
                (edge) => {
                    edge.addClass(
                        "ancestor"
                    );

                    highlightAncestors(
                        edge.source()
                    );
                }
            );
    }

    if (
        node.data("kind") ===
        "relationship"
    ) {
        node.incomers("edge")
            .forEach(
                (edge) => {
                    edge.addClass(
                        "ancestor"
                    );

                    highlightAncestors(
                        edge.source()
                    );
                }
            );
    }
}


/* =========================
FOCUS ПЕРСОНАЖА
========================= */

export function focusCharacter(
    id
) {
    if (
        !cy ||
        !data
    ) {
        return;
    }

    const node =
        cy.getElementById(
            id
        );

    if (
        node.empty()
    ) {
        return;
    }

    /*
    У режимі порівняння
    працює інша логіка.
    */

    if (
        compareMode
    ) {
        selectForComparison(
            id
        );

        return;
    }

    clearHighlights();

    cy.elements()
        .unselect();

    node.select();

    highlightAncestors(
        node
    );

    showCharacterById(
        id
    );
}


/* =========================
ПОВНЕ СКИДАННЯ
========================= */

export function clearSelection() {
    compareFirst =
        null;

    compareSecond =
        null;

    clearHighlights();

    if (cy) {
        cy.elements()
            .unselect();
    }

    const info =
        document.getElementById(
            "info"
        );

    if (info) {
        info.classList.add(
            "info-closed"
        );

        info.style.transform =
            "";

        info.style.transition =
            "";
    }

    const controls =
        document.getElementById(
            "controls"
        );

    if (
        controls &&
        window.innerWidth <= 768
    ) {
        controls.style.bottom =
            "20px";
    }
}