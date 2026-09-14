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
        <div class="info-drag-handle"></div>

        <button
            id="closeInfoButton"
            type="button"
            aria-label="Закрити панель"
        >
            ×
        </button>

        <h2>${escapeHtml(character.name)}</h2>
    `;

    /* =========================
    ПІДЗАГОЛОВОК
    ========================= */

    if (character.subtitle) {
        html += `
            <p>
                ${escapeHtml(character.subtitle)}
            </p>
        `;
    }

    /* =========================
    ОПИС
    ========================= */

    if (character.description) {
        html += `
            <h3>Опис</h3>

            <div class="description">
                ${renderDescription(
                    character.description
                )}
            </div>
        `;
    }

    /* =========================
    БАТЬКИ
    ========================= */

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
                                    data-id="${escapeHtml(
                                        parent.id
                                    )}"
                                >
                                    ${escapeHtml(
                                        parent.name
                                    )}
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

    /* =========================
    СТОСУНКИ
    ========================= */

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
                                data-id="${escapeHtml(
                                    consort.id
                                )}"
                            >
                                ${escapeHtml(
                                    consort.name
                                )}
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

    /* =========================
    ДІТИ
    ========================= */

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
                            data-id="${escapeHtml(
                                child.id
                            )}"
                        >
                            ${escapeHtml(
                                child.name
                            )}
                        </button>
                    </li>
                `;
            }
        );

        html += `
            </ul>
        `;
    }

    /* =========================
    ВСТАВЛЯЄМО ПАНЕЛЬ
    ========================= */

    info.innerHTML =
        html;

    info.classList.remove(
        "info-closed"
    );

    info.style.transform =
        "";

    info.style.transition =
        "";

    /* =========================
    ПОСИЛАННЯ НА ПЕРСОНАЖІВ
    ========================= */

    info.querySelectorAll(
        ".person-link"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    if (
                        typeof focusCharacter !==
                        "function"
                    ) {
                        return;
                    }

                    const id =
                        button.dataset.id;

                    if (!id) {
                        return;
                    }

                    focusCharacter(id);
                }
            );
        }
    );

    /* =========================
    КНОПКА ЗАКРИТТЯ
    ========================= */

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

                info.style.transform =
                    "";

                info.style.transition =
                    "";

                updateControlsPosition(
                    info
                );
            }
        );
    }

    /* =========================
    МОБІЛЬНИЙ DRAG
    ========================= */

    setupMobileDrag(info);

    updateControlsPosition(
        info
    );
}


/* =========================
РОЗБИВАЄМО ОПИС НА АБЗАЦИ
========================= */

function renderDescription(
    text
) {
    return String(text)
        .split(/\n\s*\n/)
        .map(
            (paragraph) =>
                paragraph.trim()
        )
        .filter(
            (paragraph) =>
                paragraph.length > 0
        )
        .map(
            (paragraph) => `
                <p class="description-paragraph">
                    ${escapeHtml(
                        paragraph
                    ).replace(
                        /\n/g,
                        "<br>"
                    )}
                </p>
            `
        )
        .join("");
}


/* =========================
ЗАХИСТ HTML
========================= */

function escapeHtml(
    text
) {
    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================
МОБІЛЬНИЙ DRAG
========================= */

function setupMobileDrag(
    info
) {
    if (
        window.innerWidth > 768
    ) {
        return;
    }

    const dragHandle =
        info.querySelector(
            ".info-drag-handle"
        );

    if (!dragHandle) {
        return;
    }

    if (
        dragHandle.dataset.dragReady ===
        "true"
    ) {
        updateControlsPosition(
            info
        );

        return;
    }

    dragHandle.dataset.dragReady =
        "true";

    let startY = 0;
    let currentY = 0;
    let dragging = false;

    /* =========================
    ПОЧАТОК DRAG
    ========================= */

    dragHandle.addEventListener(
        "pointerdown",
        (event) => {
            if (
                event.pointerType ===
                    "mouse" &&
                event.button !== 0
            ) {
                return;
            }

            dragging = true;

            startY =
                event.clientY;

            currentY = 0;

            dragHandle.setPointerCapture(
                event.pointerId
            );

            info.style.transition =
                "none";

            event.preventDefault();
        }
    );

    /* =========================
    РУХ DRAG
    ========================= */

    dragHandle.addEventListener(
        "pointermove",
        (event) => {
            if (!dragging) {
                return;
            }

            const difference =
                event.clientY -
                startY;

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

            event.preventDefault();
        }
    );

    /* =========================
    ЗАВЕРШЕННЯ DRAG
    ========================= */

    dragHandle.addEventListener(
        "pointerup",
        (event) => {
            if (!dragging) {
                return;
            }

            dragging = false;

            if (
                dragHandle.hasPointerCapture(
                    event.pointerId
                )
            ) {
                dragHandle.releasePointerCapture(
                    event.pointerId
                );
            }

            const panelHeight =
                info.getBoundingClientRect()
                    .height;

            const shouldClose =
                currentY >
                Math.max(
                    70,
                    panelHeight * 0.25
                );

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

    /* =========================
    СКАСУВАННЯ DRAG
    ========================= */

    dragHandle.addEventListener(
        "pointercancel",
        (event) => {
            if (!dragging) {
                return;
            }

            dragging = false;

            if (
                dragHandle.hasPointerCapture(
                    event.pointerId
                )
            ) {
                dragHandle.releasePointerCapture(
                    event.pointerId
                );
            }

            info.style.transition =
                "transform 0.25s ease";

            info.style.transform =
                "";

            currentY = 0;

            updateControlsPosition(
                info
            );
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
    dragOffset = 0
) {
    const controls =
        document.getElementById(
            "controls"
        );

    if (!controls || !info) {
        return;
    }

    if (
        window.innerWidth > 768
    ) {
        controls.style.bottom =
            "";

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
        `${panelHeight + 14 - dragOffset}px`;
}