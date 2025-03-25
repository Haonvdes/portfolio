  // Import local icons (you would replace these with actual paths to your icon files)
  const iconPaths = {
    safe: '/public/aura_pyxis.png',
    scan: '/public/aura_scan.png',
    swap: '/public/aura_swap.png',
    seekhype: '/public/aura_seekhype.png',
    Dev3Map: '/public/aura_dev3.png',
    band: '/public/aura_band.png',
    index: '/public/aura_index.png',
    nois: '/public/aura_nois.png'


};

const articles = [
    {
        id: 1,
        title: "Aura Safe",
        description: "Multi-signature and fine -grain access control, asset management tool",
        category: "Infrastructure",
        icon: iconPaths.safe,
        iconColor: 'black'
    },
    {
        id: 2,
        title: "Aura Scan",
        description: "The next generation blockchain explorer for Aura Network",
        category: "Infrastructure",
        icon: iconPaths.scan,
        iconColor: 'black'
    },
    {
        id: 3,
        title: "Aura Swap",
        description: "Swap, earn, and bridge real-world assets with secure, compliant infrastructure",
        category: "DeFi",
        icon: iconPaths.swap,
        iconColor: 'black'
    },
    {
        id: 4,
        title: "SeekHYPE",
        description: "NFT Marketplace for IP, crypto collectibles and non-fungible tokens.",
        category: "NFT",
        icon: iconPaths.seekhype,
        iconColor: 'black'
    },
    {
        id: 5,
        title: "Dev3Map",
        description: "A library for accepting Bitcoin deposits to any IBC-enabled blockchain",
        category: "Infrastructure",
        icon: iconPaths.Dev3Map,
        iconColor: 'black'
    },
    {
        id: 6,
        title: "Band Protocol",
        description: "A oracle platform that aggregates and connects real-world data.",
        category: "Infrastructure",
        icon: iconPaths.band,
        iconColor: 'black'
    },
    {
        id: 7,
        title: "Aura Index",
        description: "An indexing service to provide real-time data for Aura ecosystem",
        category: "Infrastructure",
        icon: iconPaths.index,
        iconColor: 'index'
    },
    {
        id: 8,
        title: "Noise Network",
        description: "A protocol that allows developers to use secure, and cost efficient via IBC",
        category: "Web2 Transition",
        icon: iconPaths.nois,
        iconColor: 'nois'
    }
];

class OverlappingArticles {
    constructor(containerId, articles) {
        this.container = document.getElementById(containerId);
        this.articles = articles;
        this.CARD_WIDTH = 320;
        this.CARD_HEIGHT = 280;
        this.OVERLAP_PERCENTAGE = 0.5;
        this.HOVER_SHIFT_PERCENTAGE = 0.4;

        this.renderArticles();
        this.setupEventListeners();
    }

    renderArticles() {
        this.articles.forEach((article, index) => {
            const card = this.createArticleCard(article, index);
            this.container.appendChild(card);
        });
    }

    createArticleCard(article, index) {
        const card = document.createElement('div');
        card.className = `article-card ${article.isBlue ? 'blue' : ''}`;
        card.dataset.index = index;
        card.style.left = `${this.calculateCardPosition(index)}px`;
        card.style.zIndex = index + 2;

        card.innerHTML = `
            <div class="card-header-ar">
                <div class="icon">
                    <img src="${article.icon}" alt="Icon" style="stroke: ${article.iconColor};">
                </div>
                <span class=md-medium>${article.category}</span>
            </div>
            <div class="card-content">
                <h3 class="card-title sub-heading" style="text-transform:capitalize">${article.title}</h3>
            <p class="card-description md-medium">${article.description}</p>
                
                </div>
        `;

        return card;
    }

    calculateCardPosition(index) {
        if (index === 0) return 0;
        return this.CARD_WIDTH * (1 - this.OVERLAP_PERCENTAGE) * index;
    }

    setupEventListeners() {
        this.container.addEventListener('mouseover', (e) => {
            const card = e.target.closest('.article-card');
            if (card) {
                this.handleCardHover(parseInt(card.dataset.index));
            }
        });

        this.container.addEventListener('mouseout', () => {
            this.resetCardPositions();
        });
    }

    handleCardHover(hoveredIndex) {
        const cards = this.container.querySelectorAll('.article-card');
        
        cards.forEach((card, index) => {
            if (index > hoveredIndex) {
                card.style.left = `${
                    this.calculateCardPosition(index) + 
                    this.CARD_WIDTH * this.HOVER_SHIFT_PERCENTAGE
                }px`;
            }

            // Apply hover background for the hovered card
            if (index === hoveredIndex) {
                card.classList.add(this.articles[index].hoverColor);
            } else {
                card.classList.remove('hover-blue-light');
            }
        });
    }

    resetCardPositions() {
        const cards = this.container.querySelectorAll('.article-card');
        
        cards.forEach((card, index) => {
            card.style.left = `${this.calculateCardPosition(index)}px`;
            card.classList.remove('hover-blue-light');
        });
    }
}

// Initialize the component
document.addEventListener('DOMContentLoaded', () => {
    const overlappingArticles = new OverlappingArticles('articlesContainer', articles);
});