import { focusCharacter } from "./graph.js";

export function showCharacter(character, data) {

    const info = document.getElementById("info");

    if (!info || !character) return;

    let html = `
        <h2>${character.name}</h2>
        <p>${character.subtitle || ""}</p>
    `;

    // Опис
    if (character.description) {

        html += `
            <p>${character.description}</p>
        `;

    }

    // Походження
    if (character.relationship) {

        const relationship = data.relationships.find(
            relationship => relationship.id === character.relationship
        );

        if (relationship) {

            html += `
                <h3>Походить від</h3>
                <ul>
            `;

            relationship.partners.forEach(parentId => {

                const parent = data.characters.find(
                    character => character.id === parentId
                );

                if (parent) {

                    html += `
                        <li>
                            <button
                                class="person-link"
                                data-id="${parent.id}"
                            >
                                ${parent.name}
                            </button>
                        </li>
                    `;

                }

            });

            html += `
                </ul>
            `;

        }

    }

    // Стосунки
    if (character.consorts?.length) {

        html += `
            <h3>Стосунки</h3>
            <ul>
        `;

        character.consorts.forEach(consortId => {

            const consort = data.characters.find(
                character => character.id === consortId
            );

            if (consort) {

                html += `
                    <li>
                        <button
                            class="person-link"
                            data-id="${consort.id}"
                        >
                            ${consort.name}
                        </button>
                    </li>
                `;

            }

        });

        html += `
            </ul>
        `;

    }

    // Діти
    const children = data.characters.filter(child => {

        if (!child.relationship) return false;

        const relationship = data.relationships.find(
            relationship => relationship.id === child.relationship
        );

        return relationship?.partners.includes(character.id);

    });

    if (children.length) {

        html += `
            <h3>Діти</h3>
            <ul>
        `;

        children.forEach(child => {

            html += `
                <li>
                    <button
                        class="person-link"
                        data-id="${child.id}"
                    >
                        ${child.name}
                    </button>
                </li>
            `;

        });

        html += `
            </ul>
        `;

    }

    // Виводимо картку
    info.innerHTML = html;

    // Переходи за іменами
    info.querySelectorAll(".person-link").forEach(button => {

        button.addEventListener("click", () => {

            focusCharacter(button.dataset.id);

        });

    });

}