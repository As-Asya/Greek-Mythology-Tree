import "./style.css";

import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";

import { TYPES, GROUPS } from "./config.js";
import { setGraph, focusCharacter } from "./graph.js";

cytoscape.use(dagre);

async function start() {


const response = await fetch("./mythology.json");
const data = await response.json();

// =========================
// ПЕРСОНАЖІ
// =========================

const characterNodes = data.characters.map(
    character => ({

        data: {
            id: character.id,
            label: character.name,
            type: character.type,
            group: character.group,
            power: character.power,
            kind: "character"
        }

    })
);

// =========================
// ВУЗЛИ СТОСУНКІВ
// =========================

const relationshipNodes = data.relationships.map(
    relationship => ({

        data: {
            id: `relationship-${relationship.id}`,
            kind: "relationship"
        },

        classes: "relationship-node"

    })
);

// =========================
// ЗВ'ЯЗКИ
// =========================

const edges = [];

data.relationships.forEach(
    relationship => {

        const relationshipNodeId =
            `relationship-${relationship.id}`;

        // Партнери → вузол стосунків

        relationship.partners.forEach(
            partnerId => {

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

        // Вузол стосунків → діти

        data.characters
            .filter(
                character =>
                    character.relationship ===
                    relationship.id
            )
            .forEach(
                child => {

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

// =========================
// КОЛЬОРИ ПЕРСОНАЖІВ
// =========================

const nodeStyles = [];

Object.entries(TYPES).forEach(
    ([type]) => {

        Object.entries(GROUPS).forEach(
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

// =========================
// ГРАФ
// =========================

const cy = cytoscape({

    container:
        document.getElementById("cy"),

    elements: [

        ...characterNodes,
        ...relationshipNodes,
        ...edges

    ],

    style: [

        // ПЕРСОНАЖІ

        {

            selector:
                'node[kind="character"]',

            style: {

                // Базовий колір картки

                "background-color":
                    "#E8DCC5",

                label:
                    "data(label)",

                shape:
                    "round-rectangle",

                width:
                    170,

                height:
                    75,

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
                    "center"

            }

        },

        // Кольори з config.js

        ...nodeStyles,

        // ВУЗОЛ СТОСУНКІВ

        {

            selector:
                ".relationship-node",

            style: {

                label:
                    "",

                shape:
                    "ellipse",

                width:
                    8,

                height:
                    8,

                "background-color":
                    "#B89B5E",

                "border-width":
                    0,

                opacity:
                    0.75

            }

        },

        // ВИБРАНИЙ ПЕРСОНАЖ

        {

            selector:
                'node[kind="character"]:selected',

            style: {

                "border-width":
                    5,

                "border-color":
                    "#8C6A2F"

            }

        },

        // ПРЕДКИ

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

        // УСІ ЛІНІЇ

        {

            selector:
                "edge",

            style: {

                width:
                    2,

                "line-color":
                    "#8F8F8F",

                "curve-style":
                    "bezier",

                "target-arrow-shape":
                    "none"

            }

        },

        // ЛІНІЇ СТОСУНКІВ

        {

            selector:
                ".relationship-edge",

            style: {

                width:
                    3,

                "line-color":
                    "#B89B5E",

                "line-style":
                    "solid",

                opacity:
                    0.9

            }

        },

        // ЛІНІЇ ДО ДІТЕЙ

        {

            selector:
                ".child-edge",

            style: {

                width:
                    2,

                "line-color":
                    "#8F8F8F"

            }

        },

        // ПІДСВІЧЕНІ ЛІНІЇ

        {

            selector:
                "edge.ancestor",

            style: {

                "line-color":
                    "#C28A00",

                width:
                    4

            }

        }

    ],

    layout: {

        name:
            "dagre",

        rankDir:
            "TB",

        nodeSep:
            60,

        rankSep:
            150

    }

});

// Забороняємо рухати вузли

cy.nodes().ungrabify();

// Передаємо граф у graph.js

setGraph(cy, data);

// =========================
// КЛІК ПО ПЕРСОНАЖУ
// =========================

cy.on(

    "tap",

    'node[kind="character"]',

    event => {

        focusCharacter(
            event.target.id()
        );

    }

);

// =========================
// ПОШУК
// =========================

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchResults =
    document.getElementById(
        "searchResults"
    );

if (
    searchInput &&
    searchResults
) {

    searchInput.addEventListener(

        "input",

        () => {

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();

            searchResults.innerHTML =
                "";

            if (query === "") {
                return;
            }

            const matches =
                data.characters.filter(
                    character =>
                        character.name
                            .toLowerCase()
                            .includes(query)
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
                character => {

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

}

// =========================
// КНОПКИ МАСШТАБУ
// =========================

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

// Наблизити

if (zoomInButton) {

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

}

// Віддалити

if (zoomOutButton) {

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

}

// Показати все дерево

if (fitButton) {

    fitButton.addEventListener(

        "click",

        () => {

            cy.fit(
                cy.elements(),
                60
            );

        }

    );


}
}
start();
