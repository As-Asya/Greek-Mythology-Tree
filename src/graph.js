import { showCharacter } from "./ui.js";

let cy = null;
let data = null;

export function setGraph(graph, graphData) {

    cy = graph;
    data = graphData;

}

function highlightAncestors(node) {

    if (node.hasClass("ancestor")) {
        return;
    }

    node.addClass("ancestor");

    // Якщо це персонаж —
    // переходимо до вузла його стосунків

    if (node.data("kind") === "character") {

        const character = data.characters.find(
            character => character.id === node.id()
        );

        if (!character?.relationship) {
            return;
        }

        const relationshipNode = cy.getElementById(
            `relationship-${character.relationship}`
        );

        if (relationshipNode.empty()) {
            return;
        }

        const parentEdge = relationshipNode
            .outgoers("edge")
            .filter(
                edge => edge.target().id() === node.id()
            );

        parentEdge.addClass("ancestor");

        highlightAncestors(relationshipNode);

        return;

    }

    // Якщо це вузол стосунків —
    // переходимо до обох партнерів

    if (node.data("kind") === "relationship") {

        node.incomers("edge").forEach(edge => {

            edge.addClass("ancestor");

            highlightAncestors(edge.source());

        });

    }

}

export function focusCharacter(id) {

    if (!cy || !data) return;

    const node = cy.getElementById(id);

    if (node.empty()) return;

    // Прибираємо старе підсвічування
    cy.elements().removeClass("ancestor");

    // Прибираємо старе виділення
    cy.elements().unselect();

    // Виділяємо нового персонажа
    node.select();

    // Підсвічуємо його предків
    highlightAncestors(node);

    // ВАЖЛИВО:
    // Тут більше немає cy.animate()
    // Граф не буде автоматично рухатися

    const character = data.characters.find(
        character => character.id === id
    );

    if (character) {

        showCharacter(character, data);

    }

}