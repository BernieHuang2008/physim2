/*
    UI Controls - Radio Buttons
    each option: { label: string, value: any }
*/
function RadioList(props) {
    const { options, defaultValue, onChange } = props;

    const div = document.createElement('div');
    div.className = 'radio-list';

    options.forEach((option) => {
        const label = document.createElement('label');
        label.setAttribute('key', option.value);

        const input = document.createElement('input');
        input.type = 'radio';
        input.value = option.value;
        input.checked = defaultValue === option.value;
        input.addEventListener('change', () => onChange(option.value));

        label.appendChild(input);
        label.appendChild(document.createTextNode(option.label));
        div.appendChild(label);
    });

    return div;
}

/*    
Radio Buttons with Images
    each option: { label: string, value: any, image: string (URL), imgSelected: string (URL) }
*/
function RadioWithImage(props) {
    const { options, getCurrentValue, onChange, name = 'radio-group' } = props;
    const div = document.createElement('div');
    div.className = 'radio-with-image';

    var last_selected = null;
    options.forEach((option, index) => {
        const label = document.createElement('label');
        label.className = 'radio-with-image__option';
        label.setAttribute('key', option.value);

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = name;
        input.value = option.value;
        input.checked = (getCurrentValue() === option.value);
        input.className = 'radio-with-image__input';

        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'radio-with-image__image-container';

        const img = document.createElement('img');
        img.src = input.checked && option.imgSelected ? option.imgSelected : option.image;
        img.alt = option.label;
        img.className = 'radio-with-image__image';
        
        // Create selection indicator
        const indicator = document.createElement('div');
        indicator.className = 'radio-with-image__indicator';
        
        // Create label text
        const labelText = document.createElement('span');
        labelText.className = 'radio-with-image__label';
        labelText.textContent = option.label;

        // Handle change event
        const handleChange = () => {
            if (input.checked && option.value != last_selected) {
                // Update all images in this group
                div.querySelectorAll('.radio-with-image__option').forEach((opt, idx) => {
                    const optImg = opt.querySelector('.radio-with-image__image');
                    const optInput = opt.querySelector('.radio-with-image__input');
                    const optOption = options[idx];
                    
                    if (optInput.checked && optOption.imgSelected) {
                        optImg.src = optOption.imgSelected;
                    } else {
                        optImg.src = optOption.image;
                    }
                });

                onChange(last_selected, option.value);
                last_selected = option.value;
            }
        };

        input.addEventListener('change', handleChange);
        label.addEventListener('click', (e) => {
            if (e.target === label || e.target === img || e.target === imageContainer || e.target === labelText) {
                input.checked = true;
                handleChange();
            }
        });

        // Assemble the structure
        imageContainer.appendChild(img);
        imageContainer.appendChild(indicator);
        
        label.appendChild(input);
        label.appendChild(imageContainer);
        label.appendChild(labelText);
        div.appendChild(label);
    });

    return div;
}

export { RadioList, RadioWithImage };