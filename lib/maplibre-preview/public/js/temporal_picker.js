(function () {
    let activePicker = null;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const parseInputDate = (value) => {
        const parsed = value ? new Date(value) : new Date();
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const formatInputDate = (date) => {
        const pad = number => String(number).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const close = () => {
        if (!activePicker) return;

        activePicker.cleanup?.();
        activePicker.element.remove();
        activePicker = null;
    };

    const position = (input, picker) => {
        const rect = input.getBoundingClientRect();
        const pickerWidth = Math.min(336, window.innerWidth - 16);
        const left = clamp(rect.left, 8, window.innerWidth - pickerWidth - 8);
        const aboveTop = rect.top - picker.offsetHeight - 8;
        const belowTop = rect.bottom + 8;
        const top = aboveTop >= 8 ? aboveTop : Math.min(belowTop, window.innerHeight - picker.offsetHeight - 8);

        picker.style.width = `${pickerWidth}px`;
        picker.style.left = `${left}px`;
        picker.style.top = `${Math.max(8, top)}px`;
    };

    const render = (state) => {
        const {element, input, onApply, onClear} = state;
        const monthDate = state.visibleMonth;
        const selected = state.selectedDate;
        const today = new Date();
        const monthLabel = monthDate.toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const firstOffset = (monthStart.getDay() + 6) % 7;
        const firstCell = new Date(monthStart);
        firstCell.setDate(monthStart.getDate() - firstOffset);

        element.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'temporal-picker-header';

        const title = document.createElement('div');
        title.className = 'temporal-picker-title';
        title.textContent = monthLabel;

        const nav = document.createElement('div');
        nav.className = 'temporal-picker-nav';
        [
            ['Previous month', -1, '<'],
            ['Next month', 1, '>']
        ].forEach(([label, delta, text]) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'temporal-picker-nav-button';
            button.title = label;
            button.setAttribute('aria-label', label);
            button.textContent = text;
            button.addEventListener('click', () => {
                state.visibleMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1);
                render(state);
            });
            nav.appendChild(button);
        });

        header.appendChild(title);
        header.appendChild(nav);
        element.appendChild(header);

        const calendar = document.createElement('div');
        calendar.className = 'temporal-picker-calendar';
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
            const cell = document.createElement('div');
            cell.className = 'temporal-picker-weekday';
            cell.textContent = day;
            calendar.appendChild(cell);
        });

        for (let index = 0; index < 42; index += 1) {
            const dayDate = new Date(firstCell);
            dayDate.setDate(firstCell.getDate() + index);

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'temporal-picker-day';
            dayDate.getMonth() !== monthDate.getMonth() && button.classList.add('muted');
            dayDate.toDateString() === today.toDateString() && button.classList.add('today');
            dayDate.toDateString() === selected.toDateString() && button.classList.add('selected');
            button.textContent = String(dayDate.getDate());
            button.addEventListener('click', () => {
                state.selectedDate = new Date(
                    dayDate.getFullYear(),
                    dayDate.getMonth(),
                    dayDate.getDate(),
                    selected.getHours(),
                    selected.getMinutes()
                );
                state.visibleMonth = new Date(dayDate.getFullYear(), dayDate.getMonth(), 1);
                render(state);
            });
            calendar.appendChild(button);
        }

        element.appendChild(calendar);

        const timeRow = document.createElement('div');
        timeRow.className = 'temporal-picker-time';

        const hourSelect = document.createElement('select');
        hourSelect.className = 'temporal-picker-select';
        hourSelect.setAttribute('aria-label', 'Hour');

        const minuteSelect = document.createElement('select');
        minuteSelect.className = 'temporal-picker-select';
        minuteSelect.setAttribute('aria-label', 'Minute');

        for (let hour = 0; hour < 24; hour += 1) {
            const option = document.createElement('option');
            option.value = String(hour);
            option.textContent = String(hour).padStart(2, '0');
            hourSelect.appendChild(option);
        }
        for (let minute = 0; minute < 60; minute += 1) {
            const option = document.createElement('option');
            option.value = String(minute);
            option.textContent = String(minute).padStart(2, '0');
            minuteSelect.appendChild(option);
        }

        hourSelect.value = String(selected.getHours());
        minuteSelect.value = String(selected.getMinutes());

        const updateTime = () => {
            state.selectedDate = new Date(
                state.selectedDate.getFullYear(),
                state.selectedDate.getMonth(),
                state.selectedDate.getDate(),
                Number(hourSelect.value),
                Number(minuteSelect.value)
            );
        };

        hourSelect.addEventListener('change', updateTime);
        minuteSelect.addEventListener('change', updateTime);

        timeRow.appendChild(hourSelect);
        timeRow.appendChild(document.createTextNode(':'));
        timeRow.appendChild(minuteSelect);
        element.appendChild(timeRow);

        const footer = document.createElement('div');
        footer.className = 'temporal-picker-footer';

        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.className = 'temporal-picker-button secondary';
        clearButton.textContent = 'Clear';
        clearButton.addEventListener('click', () => {
            onClear?.();
            close();
        });

        const todayButton = document.createElement('button');
        todayButton.type = 'button';
        todayButton.className = 'temporal-picker-button secondary';
        todayButton.textContent = 'Today';
        todayButton.addEventListener('click', () => {
            state.selectedDate = new Date();
            state.visibleMonth = new Date(state.selectedDate.getFullYear(), state.selectedDate.getMonth(), 1);
            render(state);
        });

        const applyButton = document.createElement('button');
        applyButton.type = 'button';
        applyButton.className = 'temporal-picker-button primary';
        applyButton.textContent = 'Apply';
        applyButton.addEventListener('click', () => {
            onApply?.(formatInputDate(state.selectedDate));
            close();
        });

        footer.appendChild(clearButton);
        footer.appendChild(todayButton);
        footer.appendChild(applyButton);
        element.appendChild(footer);

        position(input, element);
    };

    const open = (input, options = {}) => {
        if (activePicker?.input === input) return;
        close();

        const picker = document.createElement('div');
        picker.className = 'temporal-picker-popover';
        picker.setAttribute('role', 'dialog');
        picker.setAttribute('aria-label', `Select ${input.dataset.parameterName || 'date and time'}`);
        document.body.appendChild(picker);

        const selectedDate = parseInputDate(input.value);
        const state = {
            element: picker,
            input,
            selectedDate,
            visibleMonth: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
            onApply: options.onApply || (value => { input.value = value; }),
            onClear: options.onClear || (() => { input.value = ''; })
        };

        const outsideHandler = (event) => {
            if (picker.contains(event.target) || event.target === input) return;
            close();
        };
        const keyHandler = (event) => event.key === 'Escape' && close();
        const repositionHandler = () => position(input, picker);

        activePicker = {
            element: picker,
            input,
            cleanup: () => {
                document.removeEventListener('mousedown', outsideHandler);
                document.removeEventListener('keydown', keyHandler);
                window.removeEventListener('resize', repositionHandler);
                window.removeEventListener('scroll', repositionHandler, true);
            }
        };

        document.addEventListener('mousedown', outsideHandler);
        document.addEventListener('keydown', keyHandler);
        window.addEventListener('resize', repositionHandler);
        window.addEventListener('scroll', repositionHandler, true);

        render(state);
    };

    window.TemporalPicker = {open, close};
})();
