document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const canvas = document.getElementById('canvas-content');
    const addTextBtn = document.getElementById('add-text-btn');
    const textColorInput = document.getElementById('text-color');
    const fontFamilySelect = document.getElementById('font-family');
    const addEmojiBtn = document.getElementById('add-emoji-btn');
    const addImageBtn = document.getElementById('add-image-btn');
    const imageUploadInput = document.getElementById('image-upload');
    const addStoryBtn = document.getElementById('add-story-btn');
    const emojiModal = document.getElementById('emoji-picker-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const emojiGrid = document.querySelector('.emoji-grid');
    const textOptions = document.querySelector('.text-options');
    
    // State
    let activeElement = null;
    let isDragging = false;
    let startX, startY; // Track mouse position relative to element corner
    
    // Categorized emojis for better organization
    const emojis = {
        'Frequently Used': ['❤️', '😍', '😂', '👍', '🔥', '🎉', '👏', '🙌'],
        'Smileys & People': ['😀', '😊', '😎', '🤔', '😴', '🥳', '😢', '😡', '😱', '🤯', '🤩', '😜', '🤗', '😇', '🤓', '😷'],
        'Animals & Nature': ['🐶', '🐱', '🦁', '🐯', '🦊', '🐻', '🐼', '🐨', '🐵', '🦄', '🐝', '🦋', '🌸', '🌺', '🌴', '🌞', '🌈', '🔥', '🌊'],
        'Food & Drink': ['🍎', '🍕', '🍔', '🍟', '🍦', '🍩', '🍪', '🍫', '🍿', '☕', '🍷', '🍺', '🍕', '🌮', '🍣', '🍜', '🍓', '🍇', '🍉'],
        'Activities': ['⚽', '🏀', '🏈', '⚾', '🎾', '🎯', '🎮', '🎲', '🎨', '🎭', '🎬', '🎤', '🎸', '🎧', '🎮', '🎳', '🎯', '🎮'],
        'Travel & Places': ['🚗', '✈️', '🚀', '🚢', '🏠', '🏢', '🏖️', '🌋', '🗼', '🗽', '🌆', '🌃', '🌅', '🌄', '🌠', '🎇', '🎆', '🌉'],
        'Objects': ['📱', '💻', '⌚', '📷', '🎥', '📺', '☎️', '📞', '📟', '📠', '📺', '🎙️', '📻', '🎚️', '🎛️', '📡', '🔌', '💡', '🔦']
    };
    
    // Render emoji grid in the modal with categories
    function renderEmojiGrid() {
        console.log('Rendering emoji grid...');
        const emojiContainer = document.querySelector('.emoji-container');
        if (!emojiContainer) {
            console.error('Emoji container not found');
            return;
        }
        console.log('Emoji container found:', emojiContainer);
        
        let html = '';
        
        // Create tabs for each category
        html += '<div class="emoji-tabs">';
        Object.keys(emojis).forEach((category, index) => {
            const categoryId = category.toLowerCase().replace(/\s+/g, '-');
            html += `<button class="emoji-tab ${index === 0 ? 'active' : ''}" data-category="${categoryId}">${category}</button>`;
        });
        html += '</div>';
        
        // Create emoji grid for each category
        html += '<div class="emoji-categories">';
        Object.entries(emojis).forEach(([category, emojiList], index) => {
            const categoryId = category.toLowerCase().replace(/\s+/g, '-');
            html += `
                <div class="emoji-category ${index === 0 ? 'active' : ''}" data-category="${categoryId}">
                    <h4>${category}</h4>
                    <div class="emoji-grid">
                        ${emojiList.map(emoji => `
                            <button class="emoji-option" data-emoji="${emoji}">${emoji}</button>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        emojiContainer.innerHTML = html;
        
        // Set up tab switching
        document.querySelectorAll('.emoji-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = tab.dataset.category;
                
                // Update active tab
                document.querySelectorAll('.emoji-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show selected category
                document.querySelectorAll('.emoji-category').forEach(cat => {
                    cat.classList.toggle('active', cat.dataset.category === category);
                });
            });
        });
        
        // Handle emoji selection
        document.addEventListener('click', (e) => {
            const emojiOption = e.target.closest('.emoji-option');
            if (!emojiOption) return;
            
            const emoji = emojiOption.dataset.emoji || emojiOption.textContent.trim();
            if (!emoji) {
                console.error('No emoji found in the clicked element');
                return;
            }
            
            console.log('Selected emoji:', emoji);
            
            // If we have an active text element, insert the emoji
            if (activeElement && activeElement.classList.contains('text-element')) {
                try {
                    // Save current selection
                    const selection = window.getSelection();
                    
                    // If there's no selection, just append the emoji
                    if (selection.rangeCount === 0) {
                        activeElement.textContent += emoji;
                    } else {
                        const range = selection.getRangeAt(0);
                        
                        // Insert emoji
                        const textNode = document.createTextNode(emoji);
                        range.deleteContents();
                        range.insertNode(textNode);
                        
                        // Move cursor after the inserted emoji
                        range.setStartAfter(textNode);
                        range.setEndAfter(textNode);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                    
                    // Keep focus on the active element
                    activeElement.focus();
                } catch (error) {
                    console.error('Error inserting emoji:', error);
                    // Fallback: just append the emoji
                    activeElement.textContent += emoji;
                    activeElement.focus();
                }
            } else {
                // If no active text element, create one with the emoji
                console.log('No active text element, creating a new one');
                const newElement = addTextElement();
                if (newElement) {
                    newElement.textContent = emoji;
                    newElement.focus();
                }
            }
            
            // Close the emoji picker
            emojiModal.style.display = 'none';
            
            // Prevent default behavior
            e.preventDefault();
            e.stopPropagation();
            
            return false;
        });
    }
    
    // Initialize the app
    function init() {
        // Initialize the emoji picker
        renderEmojiGrid();
        
        setupEventListeners();
        
        // Make sure text options are visible when text is added
        addTextBtn.addEventListener('click', () => {
            textOptions.classList.remove('hidden');
            // Add a new text element when the button is clicked
            addTextElement();
        });
        
        // Handle clicks on the canvas to deselect elements
        canvas.addEventListener('click', (e) => {
            if (e.target === canvas) {
                setActiveElement(null);
            }
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Delete key
            if (e.key === 'Delete' && activeElement) {
                if (confirm('Delete the selected element?')) {
                    activeElement.remove();
                    activeElement = null;
                    updatePropertiesPanel();
                }
            }
            // Escape key
            else if (e.key === 'Escape') {
                setActiveElement(null);
            }
        });
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Text tools
        addTextBtn.addEventListener('click', () => {
            addTextElement();
            textOptions.classList.remove('hidden');
        });
        
        textColorInput.addEventListener('input', updateTextStyle);
        fontFamilySelect.addEventListener('change', updateTextStyle);
        
        // Emoji button click handler
        addEmojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Emoji button clicked');
            
            // Make sure the emoji picker is initialized
            if (!document.querySelector('.emoji-option')) {
                console.log('Emoji grid not found, reinitializing...');
                renderEmojiGrid();
            }
            
            // Show the modal
            emojiModal.style.display = 'flex';
            
            // If no text element is active, create one
            if (!activeElement || !activeElement.classList.contains('text-element')) {
                const newElement = addTextElement();
                if (newElement) {
                    newElement.focus();
                }
            } else {
                activeElement.focus();
            }
        });
        
        // Image tools
        addImageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Trigger file input click
            imageUploadInput.click();
        });
        
        // Handle image upload
        imageUploadInput.addEventListener('change', (e) => {
            handleImageUpload(e);
            // Make sure the image grid is on top of other elements
            const imageGrid = document.getElementById('image-grid');
            if (imageGrid) {
                imageGrid.style.zIndex = '1';
            }
        });
        
        // Add Story button
        addStoryBtn.addEventListener('click', addStory);
        
        // Modal
        closeModalBtn.addEventListener('click', () => {
            emojiModal.style.display = 'none';
        });
        
        // Close modal when clicking outside or on close button
        closeModalBtn.addEventListener('click', () => {
            emojiModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === emojiModal) {
                emojiModal.style.display = 'none';
            }
        });
        
        // Canvas interactions
        canvas.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && activeElement) {
                activeElement.remove();
                activeElement = null;
            }
        });
    }
    
    // Add a new text element to the canvas
    function addTextElement() {
        const template = document.querySelector('.text-element-template');
        if (!template) return;
        
        // Clone the template
        const textElement = template.firstElementChild.cloneNode(true);
        
        // Position in the center of the canvas
        const canvasRect = canvas.getBoundingClientRect();
        const elementRect = textElement.getBoundingClientRect();
        
        textElement.style.left = '50%';
        textElement.style.top = '50%';
        textElement.style.transform = 'translate(-50%, -50%)';
        textElement.style.color = textColorInput.value;
        textElement.style.fontFamily = fontFamilySelect.value;
        
        // Add to canvas
        canvas.appendChild(textElement);
        
        // Set up event listeners
        setupTextElement(textElement);
        
        // Set focus and activate editing
        setActiveElement(textElement);
        textElement.focus();
        
        // If it's the default text, select it for easy replacement
        if (textElement.textContent === 'Double click to edit') {
            const range = document.createRange();
            range.selectNodeContents(textElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        return textElement;
    }
    
    // Set up event listeners for a text element
    function setupTextElement(element) {
        if (!element) return;
        
        // Make element draggable
        makeElementDraggable(element);
        
        // Set up controls
        const deleteBtn = element.querySelector('.delete');
        const editBtn = element.querySelector('.edit');
        const colorPicker = element.querySelector('.color-picker');
        const fontSizeSelect = element.querySelector('.font-size-select');
        const textEditBtns = element.querySelectorAll('.text-edit-btn[data-command]');
        
        // Delete button
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this text element?')) {
                    element.remove();
                    if (activeElement === element) {
                        activeElement = null;
                        updatePropertiesPanel();
                    }
                }
            });
        }
        
        // Edit button
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                element.focus();
            });
        }
        
        // Color picker
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                element.style.color = e.target.value;
            });
            
            // Set initial color
            colorPicker.value = textColorInput.value;
        }
        
        // Font size select
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => {
                element.style.fontSize = `${e.target.value}px`;
            });
        }
        
        // Text formatting buttons
        textEditBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const command = btn.dataset.command;
                document.execCommand(command, false, null);
                
                // Toggle active state
                btn.classList.toggle('active');
                
                // Maintain focus on the editable element
                element.focus();
            });
        });
        
        // Handle focus/blur
        element.addEventListener('focus', () => {
            element.classList.add('editing');
            setActiveElement(element);
        });
        
        element.addEventListener('blur', (e) => {
            // Only remove editing class if not clicking on a control
            if (!e.relatedTarget || !element.contains(e.relatedTarget)) {
                element.classList.remove('editing');
                
                // If empty, restore default text
                if (element.textContent.trim() === '') {
                    element.textContent = element.dataset.text || 'Double click to edit';
                }
            }
        });
        
        // Handle double click to edit
        element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            element.focus();
        });
        
        // Prevent dragging when interacting with controls
        const controls = element.querySelectorAll('.text-controls *, .text-edit-toolbar *');
        controls.forEach(control => {
            control.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
        });
    }
    
    // Handle image upload
    function handleImageUpload(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Clear previous images
        const imageGrid = document.getElementById('image-grid');
        imageGrid.innerHTML = '';
        
        // Limit to 6 images
        const maxImages = Math.min(files.length, 6);
        
        // Set the appropriate layout class based on number of images
        imageGrid.className = 'image-grid';
        imageGrid.classList.add(`layout-${maxImages}`);
        
        // Create grid items for each image
        for (let i = 0; i < maxImages; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Create grid item container
                const gridItem = document.createElement('div');
                gridItem.className = 'grid-item';
                
                // Create image element
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = `Image ${i + 1}`;
                img.draggable = false;
                
                // Add image to grid item
                gridItem.appendChild(img);
                
                // For layout 3 and 5, we need to handle rows differently
                if ((maxImages === 3 || maxImages === 5) && i < 2) {
                    let row = imageGrid.querySelector('.grid-row');
                    if (!row) {
                        row = document.createElement('div');
                        row.className = 'grid-row';
                        imageGrid.appendChild(row);
                    }
                    row.appendChild(gridItem);
                } 
                // For layout 5, handle the bottom row separately
                else if (maxImages === 5 && i >= 2) {
                    let bottomRow = imageGrid.querySelector('.grid-row:last-child');
                    if (!bottomRow || bottomRow.children.length >= 2) {
                        bottomRow = document.createElement('div');
                        bottomRow.className = 'grid-row';
                        imageGrid.appendChild(bottomRow);
                    }
                    bottomRow.appendChild(gridItem);
                } 
                // For other layouts, just append to the grid
                else {
                    imageGrid.appendChild(gridItem);
                }
            };
            
            reader.readAsDataURL(file);
        }
        
        // Reset the file input
        e.target.value = '';
    }
    
    // Make an element draggable with smooth movement
    function makeElementDraggable(element) {
        element.draggable = false; // Disable native drag & drop
        element.style.cursor = 'move';
        
        // Set active element on click
        element.addEventListener('mousedown', startDrag);
        
        // Handle text element specific events
        if (element.classList.contains('text-element')) {
            // Double click to edit
            element.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                element.focus();
                textOptions.classList.remove('hidden');
            });
            
            // Handle empty content
            element.addEventListener('blur', () => {
                if (element.textContent.trim() === '') {
                    element.textContent = element.dataset.text || 'Double click to edit';
                }
            });
            
            // Handle single click (for selection)
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                setActiveElement(element);
                textOptions.classList.remove('hidden');
            });
        }
        
        // Add touch support
        element.addEventListener('touchstart', startDrag, { passive: false });
    }
    
    // Set the active element
    function setActiveElement(element) {
        // Remove active class from previous active element
        if (activeElement && activeElement !== element) {
            activeElement.classList.remove('active');
            activeElement.classList.remove('editing');
            activeElement.style.outline = '1px dashed rgba(0, 0, 0, 0.2)';
            
            // Close any open toolbars
            const toolbars = document.querySelectorAll('.text-edit-toolbar');
            toolbars.forEach(toolbar => {
                toolbar.style.display = 'none';
            });
        }
        
        // Set new active element
        const prevActive = activeElement;
        activeElement = element;
        
        // Add active styling
        if (activeElement) {
            activeElement.classList.add('active');
            activeElement.style.outline = '2px solid var(--primary-color)';
            
            // Bring to front
            activeElement.style.zIndex = '100';
            
            // Update properties panel
            updatePropertiesPanel(activeElement);
            
            // If this is a different element, ensure it's in view
            if (prevActive !== activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            // Clear properties panel if no element is active
            updatePropertiesPanel();
        }
    }
    
    // Update text style based on user selection
    function updateTextStyle() {
        if (activeElement && activeElement.classList.contains('text-element')) {
            activeElement.style.color = textColorInput.value;
            activeElement.style.fontFamily = fontFamilySelect.value;
        }
    }
    
    // Handle drag start
    function startDrag(e) {
        // Only handle left mouse button
        if (e.button !== 0) return;
        
        const target = e.target;
        
        // Check if we're clicking on a draggable element
        if (target !== canvas && !target.classList.contains('text-element') && !target.classList.contains('image-element')) {
            return;
        }
        
        // If clicking on canvas, deselect active element
        if (target === canvas) {
            if (activeElement) {
                activeElement.style.outline = '1px dashed #ccc';
                activeElement = null;
            }
            return;
        }
        
        // Set as active element if not already
        if (target !== activeElement) {
            setActiveElement(target);
        }
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        // Get current position and dimensions
        const elementRect = activeElement.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        // Calculate position relative to canvas
        startLeft = elementRect.left - canvasRect.left;
        startTop = elementRect.top - canvasRect.top;
        
        // Store element dimensions
        elementWidth = elementRect.width;
        elementHeight = elementRect.height;
        
        // Prevent text selection during drag
        e.preventDefault();
        e.stopPropagation();
        
        // Add active class for visual feedback
        activeElement.classList.add('dragging');
    }
    
    // Start dragging
    function startDrag(e) {
        // Only handle left mouse button or first touch
        if (e.type === 'mousedown' && e.button !== 0) return;
        
        const element = e.currentTarget;
        
        // Don't start drag if clicking on a button or input
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
            return;
        }
        
        e.stopPropagation();
        e.preventDefault();
        
        setActiveElement(element);
        isDragging = true;
        
        // Get initial position
        const rect = element.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        // Calculate offset from mouse to element corner
        startX = clientX - rect.left;
        startY = clientY - rect.top;
        
        // Bring to front while dragging
        element.style.zIndex = '1000';
        element.classList.add('dragging');
        
        // Add move and up listeners
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }
    
    // Handle dragging movement
    function onDragMove(e) {
        if (!isDragging || !activeElement) return;
        
        e.preventDefault();
        
        // Get current mouse/touch position
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        if (clientX === undefined || clientY === undefined) return;
        
        // Get canvas boundaries
        const canvasRect = canvas.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();
        
        // Calculate new position
        let newLeft = clientX - canvasRect.left - startX;
        let newTop = clientY - canvasRect.top - startY;
        
        // Calculate boundaries
        const minLeft = 0;
        const minTop = 0;
        const maxLeft = canvasRect.width - elementRect.width;
        const maxTop = canvasRect.height - elementRect.height;
        
        // Apply constraints
        newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
        newTop = Math.max(minTop, Math.min(newTop, maxTop));
        
        // Update position
        activeElement.style.transition = 'none';
        activeElement.style.left = `${newLeft}px`;
        activeElement.style.top = `${newTop}px`;
    }
    
    // Stop dragging
    function stopDrag(e) {
        if (!isDragging) return;
        
        isDragging = false;
        
        if (activeElement) {
            // Re-enable transitions
            activeElement.style.transition = 'all 0.2s ease';
            activeElement.style.zIndex = '1';
            activeElement.classList.remove('dragging');
            
            // Force a reflow to ensure the transition works
            void activeElement.offsetWidth;
        }
        
        // Remove event listeners
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
        
        // Prevent click events after drag
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
    
    // Update properties panel based on selected element
    function updatePropertiesPanel() {
        const propertiesPanel = document.querySelector('.properties-content');
        
        if (!activeElement) {
            propertiesPanel.innerHTML = '<p>Select an element to edit its properties</p>';
            return;
        }
        
        if (activeElement.classList.contains('text-element')) {
            // Show text properties
            propertiesPanel.innerHTML = `
                <div class="property-group">
                    <label>Text Content</label>
                    <textarea class="property-input" id="text-content" rows="3">${activeElement.textContent}</textarea>
                </div>
                <div class="property-group">
                    <label>Text Color</label>
                    <input type="color" id="text-color-prop" value="${window.getComputedStyle(activeElement).color || '#000000'}">
                </div>
                <div class="property-group">
                    <label>Font Family</label>
                    <select id="font-family-prop">
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Helvetica Neue', sans-serif">Helvetica</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="'Brush Script MT', cursive">Brush Script</option>
                    </select>
                </div>
                <div class="property-group">
                    <label>Font Size</label>
                    <input type="range" id="font-size" min="12" max="72" value="16">
                    <span id="font-size-value">16px</span>
                </div>
            `;
            
            // Set current font family
            const currentFont = window.getComputedStyle(activeElement).fontFamily;
            const fontSelect = document.getElementById('font-family-prop');
            if (fontSelect) {
                fontSelect.value = currentFont;
                
                // Add event listeners
                fontSelect.addEventListener('change', (e) => {
                    activeElement.style.fontFamily = e.target.value;
                });
            }
            
            // Set up text content editing
            const textContent = document.getElementById('text-content');
            if (textContent) {
                textContent.addEventListener('input', (e) => {
                    activeElement.textContent = e.target.value;
                });
            }
            
            // Set up color picker
            const colorPicker = document.getElementById('text-color-prop');
            if (colorPicker) {
                colorPicker.addEventListener('input', (e) => {
                    activeElement.style.color = e.target.value;
                });
            }
            
            // Set up font size slider
            const fontSizeSlider = document.getElementById('font-size');
            const fontSizeValue = document.getElementById('font-size-value');
            if (fontSizeSlider && fontSizeValue) {
                const currentSize = parseInt(window.getComputedStyle(activeElement).fontSize) || 16;
                fontSizeSlider.value = currentSize;
                fontSizeValue.textContent = `${currentSize}px`;
                
                fontSizeSlider.addEventListener('input', (e) => {
                    const size = e.target.value;
                    activeElement.style.fontSize = `${size}px`;
                    fontSizeValue.textContent = `${size}px`;
                });
            }
            
        } else if (activeElement.classList.contains('image-element')) {
            // Show image properties
            propertiesPanel.innerHTML = `
                <div class="property-group">
                    <label>Image Size</label>
                    <input type="range" id="image-size" min="50" max="200" value="100">
                    <span id="image-size-value">100%</span>
                </div>
                <div class="property-group">
                    <label>Opacity</label>
                    <input type="range" id="image-opacity" min="10" max="100" value="100">
                    <span id="opacity-value">100%</span>
                </div>
                <div class="property-group">
                    <button id="replace-image" class="tool-btn">
                        <i class="fas fa-sync-alt"></i> Replace Image
                    </button>
                </div>
                <div class="property-group">
                    <button id="delete-image" class="tool-btn" style="color: #ff4d4f;">
                        <i class="fas fa-trash"></i> Delete Image
                    </button>
                </div>
            `;
            
            // Set up image size slider
            const sizeSlider = document.getElementById('image-size');
            const sizeValue = document.getElementById('image-size-value');
            if (sizeSlider && sizeValue) {
                sizeSlider.addEventListener('input', (e) => {
                    const scale = e.target.value / 100;
                    activeElement.style.width = `${scale * 100}%`;
                    sizeValue.textContent = `${e.target.value}%`;
                });
            }
            
            // Set up opacity slider
            const opacitySlider = document.getElementById('image-opacity');
            const opacityValue = document.getElementById('opacity-value');
            if (opacitySlider && opacityValue) {
                const currentOpacity = Math.round(parseFloat(window.getComputedStyle(activeElement).opacity || '1') * 100);
                opacitySlider.value = currentOpacity;
                opacityValue.textContent = `${currentOpacity}%`;
                
                opacitySlider.addEventListener('input', (e) => {
                    const opacity = e.target.value / 100;
                    activeElement.style.opacity = opacity;
                    opacityValue.textContent = `${e.target.value}%`;
                });
            }
            
            // Set up replace image button
            const replaceBtn = document.getElementById('replace-image');
            if (replaceBtn) {
                replaceBtn.addEventListener('click', () => {
                    imageUploadInput.click();
                    imageUploadInput.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                activeElement.src = event.target.result;
                            };
                            reader.readAsDataURL(file);
                        }
                    };
                });
            }
            
            // Set up delete button
            const deleteBtn = document.getElementById('delete-image');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this image?')) {
                        activeElement.remove();
                        activeElement = null;
                        updatePropertiesPanel();
                    }
                });
            }
        }
    }
    
    // Add story functionality
    function addStory() {
        // In a real implementation, this would save the story to a database
        // or prepare it for posting to a social media platform
        
        // For now, we'll create a preview and show a success message
        const canvasContent = document.getElementById('canvas-content');
        const storyData = {
            elements: [],
            timestamp: new Date().toISOString()
        };
        
        // Collect all elements and their properties
        const elements = canvasContent.querySelectorAll('.text-element, .image-element');
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            
            const elementData = {
                type: element.classList.contains('text-element') ? 'text' : 'image',
                content: element.classList.contains('text-element') ? element.textContent : element.src,
                style: {
                    left: `${((rect.left - canvasRect.left) / canvasRect.width * 100).toFixed(2)}%`,
                    top: `${((rect.top - canvasRect.top) / canvasRect.height * 100).toFixed(2)}%`,
                    width: element.style.width || 'auto',
                    height: element.style.height || 'auto',
                    color: element.style.color || 'black',
                    fontFamily: element.style.fontFamily || 'Arial, sans-serif',
                    fontSize: element.style.fontSize || '16px',
                    opacity: element.style.opacity || '1',
                    zIndex: element.style.zIndex || '1'
                }
            };
            
            storyData.elements.push(elementData);
        });
        
        console.log('Story data:', storyData);
        
        // Show success message
        alert('Story saved successfully! In a real implementation, this would be posted to your stories.');
        
        // Here you would typically send storyData to your backend
        // Example: fetch('/api/stories', { method: 'POST', body: JSON.stringify(storyData) });
    }
    
    // Initialize the app
    init();
});
