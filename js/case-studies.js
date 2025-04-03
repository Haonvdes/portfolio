// ecosystem //
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

// End of ecosystem //





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




//This is for the carosell on the case study page//

const featureSections = [
    {
        id: "tools",
        title: "Tools",
        description: "A high-performing team is built on collaboration, transparency, and accountability. We embraced Scrum values to create a culture of continuous improvement and trust",
        subtext: "Main tools", // Add subtext here
        features: [
            {
                icon: "/public/ar_tool_figma.svg", // Use image path
                text: "Figma",
                image: "/public/ar_tool_figma.png",
                alt: "Figma"
            },
            {
                icon: "/public/ar_tool_jira.svg", // Replace inline SVG with image path
                text: "Jira",
                image: "/public/ar_tool_jira.png",
                alt: "Jira"
            },
            {
                icon: "/public/ar_tool_discord.svg", // Replace inline SVG with image path
                text: "Discord",
                image: "/public/ar_tool_discord.png",
                alt: "Discord"
            },
            {
                icon: "/public/ar_tool_teams.svg", // Replace inline SVG with image path
                text: "Microsoft Teams",
                image: "/public/ar_process_jira.png",
                alt: "Microsoft Teams"
            },
            {
                icon: "/public/ar_tool_github.svg", // Replace inline SVG with image path
                text: "Github",
                image: "/public/ar_team.png",
                alt: "Github"
            }
        ]
    },
    {
        id: "feature-section-2",
        title: "Cloud Solutions",
        description: "Powerful cloud infrastructure for modern businesses and enterprises.",
        features: [
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>',
                text: "Cloud Storage",
                image: "/api/placeholder/500/400",
                alt: "Cloud Storage"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>',
                text: "Server Solutions",
                image: "/api/placeholder/500/400",
                alt: "Server Solutions"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
                text: "Security Measures",
                image: "/api/placeholder/500/400",
                alt: "Security Measures"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
                text: "Management Console",
                image: "/api/placeholder/500/400",
                alt: "Management Console"
            }
        ]
    },
    {
        id: "feature-section-3",
        title: "Developer Tools",
        description: "Supercharge your development workflow with our professional-grade tools.",
        features: [
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
                text: "Code Editor",
                image: "/api/placeholder/500/400",
                alt: "Code Editor"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>',
                text: "Version Control",
                image: "/api/placeholder/500/400",
                alt: "Version Control"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
                text: "Debugging Tools",
                image: "/api/placeholder/500/400",
                alt: "Debugging Tools"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
                text: "CLI Tools",
                image: "/api/placeholder/500/400",
                alt: "CLI Tools"
            }
        ]
    },
    {
        id: "feature-section-4",
        title: "AI Solutions",
        description: "Harness the power of artificial intelligence for your business needs.",
        features: [
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
                text: "Machine Learning",
                image: "/api/placeholder/500/400",
                alt: "Machine Learning"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
                text: "Document Analysis",
                image: "/api/placeholder/500/400",
                alt: "Document Analysis"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
                text: "Image Recognition",
                image: "/api/placeholder/500/400",
                alt: "Image Recognition"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
                text: "Natural Language Processing",
                image: "/api/placeholder/500/400",
                alt: "Natural Language Processing"
            }
        ]
    }
];

// Component rendering function
function renderFeatureSection(sectionData) {
    const sectionEl = document.getElementById(sectionData.id);
    if (!sectionEl) return;

    // Create the main container
    const container = document.createElement('div');
    container.className = 'container cs-container';

    // Create left side
    const leftSide = document.createElement('div');
    leftSide.className = 'cs-left-side';

    // Create cs-introduce div
    const introduceDiv = document.createElement('div');
    introduceDiv.className = 'cs-introduce';

    // Add title
    const title = document.createElement('h3');
    title.textContent = sectionData.title;
    introduceDiv.appendChild(title);

    // Add description
    const description = document.createElement('p');
    description.className = 'md-medium';
    description.textContent = sectionData.description;
    introduceDiv.appendChild(description);

    // Append cs-introduce to left side
    leftSide.appendChild(introduceDiv);

    // Create feature wrapper div
    const featureWrapper = document.createElement('div');
    featureWrapper.className = 'cs-feature-wrapper';

    // Add subtext
    const subtext = document.createElement('p');
    subtext.className = 'md-bold';
    subtext.textContent = sectionData.subtext || ''; // Use subtext from sectionData
    featureWrapper.appendChild(subtext);

    // Create feature list
    const featureList = document.createElement('div');
    featureList.className = 'cs-feature-list';

    // Add features and images
    sectionData.features.forEach((feature, index) => {
        // Create feature item
        const featureItem = document.createElement('div');
        featureItem.className = 'cs-feature-item';
        featureItem.setAttribute('data-image', index + 1);

        // Add icon as an image
        const iconDiv = document.createElement('div');
        iconDiv.className = 'cs-feature-icon';
        const iconImg = document.createElement('img');
        iconImg.src = feature.icon; // Use the icon path as the image source
        iconImg.alt = feature.alt || 'Feature Icon';
        iconDiv.appendChild(iconImg);
        featureItem.appendChild(iconDiv);

        // Add text
        const textDiv = document.createElement('div');
        textDiv.className = 'md-medium';
        textDiv.textContent = feature.text;
        featureItem.appendChild(textDiv);

        // Add to feature list
        featureList.appendChild(featureItem);
    });

    // Append feature list to feature wrapper
    featureWrapper.appendChild(featureList);

    // Append feature wrapper to left side
    leftSide.appendChild(featureWrapper);

    // Create right side
    const rightSide = document.createElement('div');
    rightSide.className = 'cs-right-side';

    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'cs-image-container';

    // Add images
    sectionData.features.forEach((feature, index) => {
        const image = document.createElement('img');
        image.className = 'cs-feature-image';
        image.src = feature.image;
        image.alt = feature.alt;
        image.setAttribute('data-image', index + 1);
        imageContainer.appendChild(image);

        // Make first item active by default
        if (index === 0) {
            image.classList.add('cs-active');
        }
    });

    // Add image container to right side
    rightSide.appendChild(imageContainer);

    // Add sides to container
    container.appendChild(leftSide);
    container.appendChild(rightSide);

    // Add container to section
    sectionEl.appendChild(container);

    // Add hover event listeners
    const featureItems = sectionEl.querySelectorAll('.cs-feature-item');
    const featureImages = sectionEl.querySelectorAll('.cs-feature-image');

    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            // Remove active class from all items in this section
            featureItems.forEach(i => i.classList.remove('cs-active'));
            featureImages.forEach(img => img.classList.remove('cs-active'));

            // Add active class to current item
            this.classList.add('cs-active');

            // Get the data-image attribute value
            const imageId = this.getAttribute('data-image');

            // Find and activate the corresponding image
            const targetImage = sectionEl.querySelector(`.cs-feature-image[data-image="${imageId}"]`);
            if (targetImage) {
                targetImage.classList.add('cs-active');
            }
        });
    });
}

// Initialize all sections
document.addEventListener('DOMContentLoaded', function() {
    featureSections.forEach(section => renderFeatureSection(section));
});



//End of carosel// This is for the case study page //