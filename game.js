createDominoElement(domino, index, isSelectable = false, size = 'normal') {
    const div = document.createElement('div');
    div.className = 'domino-piece';
    if (domino[0] === domino[1]) {
        div.classList.add('double');
    }
    
    if (size === 'small') {
        div.classList.add('small');
    } else if (size === 'tiny') {
        div.classList.add('tiny');
    }
    
    div.dataset.index = index;
    div.dataset.value = `${domino[0]}-${domino[1]}`;
    
    // Create the two halves
    const half1 = document.createElement('div');
    half1.className = `domino-half dots-${domino[0]}`;
    
    const half2 = document.createElement('div');
    half2.className = `domino-half dots-${domino[1]}`;
    
    // Create divider
    const divider = document.createElement('div');
    divider.className = 'domino-divider';
    
    // Create dots containers
    const dots1 = document.createElement('div');
    dots1.className = 'dots-container';
    
    const dots2 = document.createElement('div');
    dots2.className = 'dots-container';
    
    // Add 9 dots to each container
    for (let i = 0; i < 9; i++) {
        const dot1 = document.createElement('div');
        dot1.className = 'dot';
        dots1.appendChild(dot1);
        
        const dot2 = document.createElement('div');
        dot2.className = 'dot';
        dots2.appendChild(dot2);
    }
    
    // Assemble the domino
    half1.appendChild(dots1);
    half2.appendChild(dots2);
    
    if (domino[0] === domino[1]) {
        // Double: stack vertically
        div.appendChild(half1);
        div.appendChild(divider);
        div.appendChild(half2);
    } else {
        // Regular: side by side
        div.appendChild(half1);
        div.appendChild(divider);
        div.appendChild(half2);
    }
    
    // Add selection behavior
    if (isSelectable) {
        div.addEventListener('click', () => this.selectDomino(index));
    }
    
    return div;
}
