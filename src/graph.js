import { showCharacter } from "./ui.js";

let cy = null;
let data = null;

/* =========================
ЗБЕРІГАЄМО ГРАФ І ДАНІ
========================= */

export function setGraph(
    graph,
    graphData
) {
    cy = graph;
    data = graphData;
}

/* =========================
ПІДСВІЧУВАННЯ ПРЕДКІВ
========================= */

function highlightAncestors(node) {
    if (!node || node.empty()) {
        return;
    }

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

    /*
    Якщо це персонаж,
    шукаємо вузол стосунків,
    через який він походить.
    */

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
            !character ||
            !character.relationship
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

        /*
        Знаходимо лінію
        від вузла стосунків
        до персонажа.
        */

        const childEdge =
            relationshipNode
                .outgoers("edge")
                .filter(
                    (edge) =>
                        edge.target().id() ===
                        node.id()
                );

        childEdge.addClass(
            "ancestor"
        );

        highlightAncestors(
            relationshipNode
        );

        return;
    }

    /*
    Якщо це вузол стосунків,
    переходимо до обох
    партнерів.
    */

    if (
        node.data("kind") ===
        "relationship"
    ) {
        node
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
}

/* =========================
ВИБІР ПЕРСОНАЖА
========================= */

export function focusCharacter(id) {
    if (
        !cy ||
        !data
    ) {
        return;
    }

    const node =
        cy.getElementById(id);

    if (
        !node ||
        node.empty()
    ) {
        return;
    }

    /*
    Прибираємо попереднє
    підсвічування.
    */

    cy.elements().removeClass(
        "ancestor"
    );

    /*
    Прибираємо попередній
    вибір.
    */

    cy.elements().unselect();

    /*
    Виділяємо персонажа.
    */

    node.select();

    /*
    Підсвічуємо його
    предків.
    */

    highlightAncestors(
        node
    );

    /*
    Шукаємо дані
    вибраного персонажа.
    */

    const character =
        data.characters.find(
            (item) =>
                item.id === id
        );

    if (!character) {
        return;
    }

    /*
    Передаємо focusCharacter
    у UI як функцію.
    
    Завдяки цьому ui.js
    не імпортує graph.js,
    і циклічного імпорту немає.
    */

    showCharacter(
        character,
        data,
        focusCharacter
    );
}