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
        title: "SeekHYPE",
        description: "NFT Marketplace for IP, crypto collectibles and non-fungible tokens.",
        category: "NFT",
        icon: iconPaths.seekhype,
        iconColor: 'black'
    },
    {
        id: 2,
        title: "Aura Swap",
        description: "Swap, earn, and bridge real-world assets with secure, compliant infrastructure",
        category: "DeFi",
        icon: iconPaths.swap,
        iconColor: 'black'
    },
    {
        id: 3,
        title: "Aura Safe",
        description: "Multi-signature and fine -grain access control, asset management tool",
        category: "Infrastructure",
        icon: iconPaths.safe,
        iconColor: 'black'
    },
    {
        id: 4,
        title: "Aura Scan",
        description: "The next generation blockchain explorer for Aura Network",
        category: "Infrastructure",
        icon: iconPaths.scan,
        iconColor: 'black'
    },
    {
        id: 5,
        title: "Aura Index",
        description: "An indexing service to provide real-time data for Aura ecosystem",
        category: "Infrastructure",
        icon: iconPaths.index,
        iconColor: 'index'
    },
    {
        id: 7,
        title: "Band Protocol",
        description: "A oracle platform that aggregates and connects real-world data.",
        category: "Infrastructure",
        icon: iconPaths.band,
        iconColor: 'black'
    },
    {
        id: 8,
        title: "Noise Network",
        description: "A protocol that allows developers to use secure, and cost efficient via IBC",
        category: "Web2 Transition",
        icon: iconPaths.nois,
        iconColor: 'nois'
    },
    {
        id: 6,
        title: "Dev3Map",
        description: "A library for accepting Bitcoin deposits to any IBC-enabled blockchain",
        category: "Infrastructure",
        icon: iconPaths.Dev3Map,
        iconColor: 'black'
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

// This is for fact card case study//

const contentMap = {
    SeekHype: {
        img: "/public/sh_case.webp",
        main: ["NFT Marketplace", "Decentralized Exchange", "Staking and Governance", "DAO and Community"],
        audience: ["Crypto Investors", "Developers", "Traders"],
        format: ["Web App", "Mobile Web App"],
        scope: ["Discovery", "User Experience", "Development", "Marketing"],
        link: "https://beta.seekhype.io/",
        description: "SeekHype is an innovative platform for discovering and trading trending NFTs, designed to make the NFT space accessible to Web2 users. It offers a user-friendly interface and seamless integration with Aura Network, ensuring secure and transparent transactions. SeekHype empowers creators, collectors, and investors by bridging the digital and physical worlds, enabling ownership of unique IRL NFTs like artwork, merchandise, and experiences"
    },
    Scan: {
        img: "/public/sc_cover.png",
        main: ["Security Audit", "Transaction Verification", "Smart Contract Analysis"],
        audience: ["Blockchain Developers", "Security Analysts"],
        format: ["Web App", "Mobile Web App"],
        scope: ["User Interface", "User Experience", "Optimization"],
        link: "https://aurascan.io/",
        description: "Scan is a blockchain explorer focused on tracking transactions and analyzing smart contracts. It provides essential tools for blockchain developers and security analysts to audit security, verify transactions, and optimize smart contract functionality. With an emphasis on user experience and interface optimization, Scan simplifies complex blockchain data for its users"
    },
    Swap: {
        img: "/public/sw_case.png",
        main: ["Token Swapping", "Liquidity Pools", "Yield Farming"],
        audience: ["DeFi Users", "Liquidity Providers"],
        format: ["Web App", "Mobile Web App"],
        scope: ["Branding", "Discovery", "User Experience", "Development", "Marketing"],
        link: "https://auraswap.io/",
        description: "Swap facilitates seamless token exchanges across multiple blockchain networks. It supports token swapping, liquidity pools, and yield farming, making it ideal for DeFi users and liquidity providers. The platform prioritizes branding, user experience, and development to enhance accessibility for decentralized finance enthusiasts"
    },
    Safe: {
        img: "/public/sf_cover.png",
        main: ["Digital Wallet", "Multi-Signature Support", "Secure Storage"],
        audience: ["Crypto Holders", "Institutional Investors"],
        format: ["Web App", "Mobile Web App"],
        scope: ["User Interface", "User Experience", "Optimization"],
        link: "https://pyxis.aura.network/",
        description: "Safe offers secure storage solutions for digital assets through its digital wallet with multi-signature support. Tailored for crypto holders and institutional investors, Safe ensures optimal security while enhancing user interface and experience across web and mobile platforms"
    },
    Bot: {
        img: "/public/ab_cover.png",
        main: ["Digital Wallet", "Multi-Signature Support", "Secure Storage"],
        audience: ["Crypto Holders", "Institutional Investors"],
        format: ["Web App", "Mobile Web App"],
        scope: ["Security Enhancement", "User Privacy", "Cross-Platform Development"],
        link: "https://x.com/BBBnat1on",
        description: "Bot is a toolkit designed for developers working on the Aura Network. It focuses on enhancing security, user privacy, and cross-platform development to provide robust solutions for building blockchain applications"
    },
    Box: {
        img: "/public/sh_case.webp",
        main: ["Digital Wallet", "Multi-Signature Support", "Secure Storage"],
        audience: ["Crypto Holders", "Institutional Investors"],
        format: ["Web App", "Mobile Web App"],
        scope: ["Security Enhancement", "User Privacy", "Cross-Platform Development"],
        link: "https://box.aura.network/",
        description: "Dev is a toolkit for developers building on the Aura Network."
    },
    Index: {
        img: "/public/sh_case.webp",
        main: ["Crypto Index Funds", "Automated Portfolio", "Market Analysis"],
        audience: ["Passive Investors", "Portfolio Managers"],
        format: ["Web App", "Mobile Web App"],
        scope: ["Financial Research", "Automated Trading", "Performance Tracking"],
        link: "https://horoscope.aura.network/",
        description: "Index provides comprehensive analytics for blockchain data through crypto index funds, automated portfolio management, and market analysis. Designed for passive investors and portfolio managers, it focuses on financial research, automated trading strategies, and performance tracking to optimize investment decisions"
    }
};

// Function to load content
function loadContent(key, shouldScroll = false) {
    const data = contentMap[key];
    const descriptionElement = document.getElementById("casedescription");
    const displayImage = document.getElementById("displayImage");
    const factCard = document.getElementById("showCaseDetail");

    // Add fade-out transition
    descriptionElement.style.transition = "opacity 0.3s";
    displayImage.style.transition = "opacity 0.3s";
    factCard.style.transition = "opacity 0.3s";
    descriptionElement.style.opacity = 0;
    displayImage.style.opacity = 0;
    factCard.style.opacity = 0;

    setTimeout(() => {
        // Update content after fade-out
        descriptionElement.textContent = data.description || "Description not available.";
        displayImage.src = data.img;

        updateList("fact-main", data.main);
        updateList("fact-audience", data.audience);
        updateList("fact-format", data.format);
        updateList("fact-scope", data.scope);

        // Add fade-in transition
        descriptionElement.style.opacity = 1;
        displayImage.style.opacity = 1;
        factCard.style.opacity = 1;
    }, 300);

    // Update active button class
    updateActiveButton(key);

    // Update call-to-action button link dynamically
    const ctaButton = document.getElementById("ctaButton");
    ctaButton.href = data.link;
}

function updateList(id, items) {
    const list = document.getElementById(id);
    list.innerHTML = "";
    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        li.classList.add("md-regular");
        list.appendChild(li);
    });
}

function updateActiveButton(selectedKey) {
    // Get all buttons
    const buttons = document.querySelectorAll(".button-group button");
    buttons.forEach(button => {
        // Check if the button's onclick matches the selected key
        if (button.getAttribute("onclick").includes(selectedKey)) {
            button.classList.remove("btn-secondary");
            button.classList.add("btn-primary");
        } else {
            button.classList.remove("btn-primary");
            button.classList.add("btn-secondary");
        }
    });
}

// Load default content on page load WITHOUT scrolling
window.onload = function () {
    loadContent('SeekHype', false);
};
