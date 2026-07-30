export function showCharacter(
    character,
    data,
    focusCharacter
) {
    const info =
        document.getElementById("info");

    if (!info || !character) {
        return;
    }

    let html = `
        <button
            id="closeInfoButton"
            type="button"
            aria-label="Закрити панель"
        >
            ×
        </button>

        <h2>${character.name}</h2>
    `;

    if (character.subtitle) {
        html += `
            <p>
                ${character.subtitle}
            </p>
        `;
    }

    if (character.description) {
        html += `
            <h3>Опис</h3>

            <p>
                ${character.description}
            </p>
        `;
    }

    if (character.relationship) {
        const relationship =
            data.relationships.find(
                (item) =>
                    item.id ===
                    character.relationship
            );

        if (relationship) {
            const parents =
                relationship.partners
                    .map(
                        (parentId) =>
                            data.characters.find(
                                (item) =>
                                    item.id ===
                                    parentId
                            )
                    )
                    .filter(Boolean);

            if (parents.length > 0) {
                html += `
                    <h3>
                        Походить від
                    </h3>

                    <ul>
                `;

                parents.forEach(
                    (parent) => {
                        html += `
                            <li>
                                <button
                                    class="person-link"
                                    type="button"
                                    data-id="${parent.id}"
                                >
                                    ${parent.name}
                                </button>
                            </li>
                        `;
                    }
                );

                html += `
                    </ul>
                `;
            }
        }
    }

    if (
        Array.isArray(
            character.consorts
        ) &&
        character.consorts.length > 0
    ) {
        const consorts =
            character.consorts
                .map(
                    (consortId) =>
                        data.characters.find(
                            (item) =>
                                item.id ===
                                consortId
                        )
                )
                .filter(Boolean);

        if (consorts.length > 0) {
            html += `
                <h3>
                    Стосунки
                </h3>

                <ul>
            `;

            consorts.forEach(
                (consort) => {
                    html += `
                        <li>
                            <button
                                class="person-link"
                                type="button"
                                data-id="${consort.id}"
                            >
                                ${consort.name}
                            </button>
                        </li>
                    `;
                }
            );

            html += `
                </ul>
            `;
        }
    }

    const children =
        data.characters.filter(
            (child) => {
                if (
                    !child.relationship
                ) {
                    return false;
                }

                const relationship =
                    data.relationships.find(
                        (item) =>
                            item.id ===
                            child.relationship
                    );

                return (
                    relationship &&
                    relationship.partners.includes(
                        character.id
                    )
                );
            }
        );

    if (children.length > 0) {
        html += `
            <h3>
                Діти
            </h3>

            <ul>
        `;

        children.forEach(
            (child) => {
                html += `
                    <li>
                        <button
                            class="person-link"
                            type="button"
                            data-id="${child.id}"
                        >
                            ${child.name}
                        </button>
                    </li>
                `;
            }
        );

        html += `
            </ul>
        `;
    }

    info.innerHTML = html;

    info.classList.remove(
        "info-closed"
    );

    info.style.transform = "";

    info.querySelectorAll(
        ".person-link"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    focusCharacter(
                        button.dataset.id
                    );
                }
            );
        }
    );

    const closeButton =
        info.querySelector(
            "#closeInfoButton"
        );

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            () => {
                info.classList.add(
                    "info-closed"
                );
            }
        );
    }

    setupMobileDrag(info);
}


/* =========================
ДРАГ ПАНЕЛІ НА ТЕЛЕФОНІ
========================= */

function setupMobileDrag(info) {
    if (
        window.innerWidth > 768
    ) {
        return;
    }

    if (
        info.dataset.dragReady ===
        "true"
    ) {
        updateControlsPosition(
            info
        );

        return;
    }

    info.dataset.dragReady =
        "true";

    let startY = 0;

    let currentY = 0;

    let dragging = false;

    info.addEventListener(
        "touchstart",
        (event) => {
            if (
                event.touches.length !==
                1
            ) {
                return;
            }

            startY =
                event.touches[0]
                    .clientY;

            currentY = 0;

            dragging = true;

            info.style.transition =
                "none";
        },
        {
            passive: true
        }
    );

    info.addEventListener(
        "touchmove",
        (event) => {
            if (!dragging) {
                return;
            }

            const touchY =
                event.touches[0]
                    .clientY;

            const difference =
                touchY - startY;

            currentY =
                Math.max(
                    0,
                    difference
                );

            info.style.transform =
                `translateY(${currentY}px)`;

            updateControlsPosition(
                info,
                currentY
            );
        },
        {
            passive: true
        }
    );

    info.addEventListener(
        "touchend",
        () => {
            if (!dragging) {
                return;
            }

            dragging = false;

            const panelHeight =
                info.offsetHeight;

            const shouldClose =
                currentY >
                panelHeight * 0.3;

            info.style.transition =
                "transform 0.25s ease";

            if (shouldClose) {
                info.classList.add(
                    "info-closed"
                );

                info.style.transform =
                    "";

                updateControlsPosition(
                    info
                );
            } else {
                info.style.transform =
                    "";

                updateControlsPosition(
                    info
                );
            }

            currentY = 0;
        }
    );

    updateControlsPosition(
        info
    );
}


/* =========================
ПОЗИЦІЯ КНОПОК
========================= */

function updateControlsPosition(
    info,
    dragAmount = 0
) {
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
        info.offsetHeight;

    const bottom =
        Math.max(
            20,
            panelHeight -
            dragAmount +
            12
        );

    controls.style.bottom =
        `${bottom}px`;
}