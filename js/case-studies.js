// ecosystem //
// Mirrors aura.network/ecosystem: same projects, order, tags and copy.
const articles = [
    { title: "Aurascan", category: "Infrastructure", description: "The next generation blockchain explorer for Aura Network", icon: '/public/aura_scan.png' },
    { title: "Aura Safe", category: "Infrastructure", description: "Multi-signature and fine-grain access control, asset management tool", icon: '/public/aura_pyxis.png' },
    { title: "Aura Index", category: "Infrastructure", description: "An indexing service to provide real-time data for Aura ecosystem", icon: '/public/aura_index.png' },
    { title: "Band Protocol", category: "Infrastructure", description: "A cross-chain data oracle platform that aggregates and connects real-world data and APIs to smart contracts.", icon: '/public/aura_band.png' },
    { title: "Nois Network", category: "Infrastructure", description: "Reliable Randomness For the Interchain", icon: '/public/aura_nois.png' },
    { title: "Dev3Map", category: "Infrastructure", description: "The Interchain Developers Metrics Map", icon: '/public/aura_dev3.png' },
    { title: "Nimbus", category: "DeFi", description: "A Personalized Portfolio for Crypto investors", icon: '/public/aura_nimbus.png' },
    { title: "AuraSwap", category: "DeFi", description: "Swap, earn, and bridge real-world assets with secure, compliant infrastructure", icon: '/public/aura_swap.png' },
    { title: "BingX", category: "CEX", description: "", icon: '/public/aura_bingx.png' },
    { title: "MEXC", category: "CEX", description: "", icon: '/public/aura_mexc.png' },
    { title: "ONUS", category: "CEX", description: "", icon: '/public/aura_onus.png' },
    { title: "Gate", category: "CEX", description: "", icon: '/public/aura_gate.png' },
    { title: "Aliniex", category: "CEX", description: "", icon: '/public/aura_aliniex.png' },
    { title: "Monsterra", category: "Web3 Game", description: "A leading multi-chain NFT Game with free-to-play-and-earn mechanism developed by CrescentShine Studio, offering gamers an unparalleled and immersive gaming experience.", icon: '/public/aura_monsterra.png' },
    { title: "Yooldo", category: "Web3 Game", description: "Yooldo is a gaming platform renowned for its innovative Anti abuse system, Jury DAO", icon: '/public/aura_yooldo.png' },
    { title: "AhaFast Ride 2 Earn", category: "Web2 Transition", description: "Spearheading the Blockchain O2O (Online-to-offline) movement in Vietnam", icon: '/public/aura_aha.webp' },
    { title: "Subwallet", category: "Wallet", description: "A non-custodial Web3 Wallet", icon: '/public/aura_subwallet.png' },
    { title: "Coin98", category: "Wallet", description: "The #1 non-custodial, multi-chain wallet, and DeFi gateway, designed to seamlessly connect users to the crypto world in a safe and secure manner.", icon: '/public/aura_coin98.png' },
    { title: "Keplr", category: "Wallet", description: "Wallet for the Inter blockchain ecosystem", icon: '/public/aura_keplr.png' },
    { title: "Leap Wallet", category: "Wallet", description: "The Super Wallet for Web3", icon: '/public/aura_leap.png' },
    { title: "Klever", category: "Wallet", description: "The Ultimate Crypto Wallet for Your Digital Assets", icon: '/public/aura_klever.png' },
    { title: "SeekHYPE", category: "NFT", description: "NFT Marketplace for IP", icon: '/public/aura_seekhype.png' },
    { title: "Stakify", category: "NFT", description: "NFT Staking Campaign Platform", icon: '/public/aura_stakify.png' },
    { title: "Aura Validators", category: "Validator", description: "", icon: '/public/aura_scan.png' },
    { title: "Micro3", category: "SocialFi", description: "A Decentralized SocialFi Mint-To-Earn platform that empowers Web3 projects and individuals through the creator economy, leveraging advanced LayerZero and Chainlink technologies.", icon: '/public/aura_micro3.png' }
];

class OverlappingArticles {
    constructor(containerId, articles) {
        this.container = document.getElementById(containerId);
        this.articles = articles;
        this.CARD_WIDTH = 320;
        this.CARD_HEIGHT = 280;
        // Distance between card lefts: 3/8 of each card sits under the next.
        this.STRIDE = 200;
        this.HOVER_GAP = 24;

        this.renderArticles();
        // Sized to include the hover shift (and the hovered card's tilt), so
        // hovering never changes the strip's scroll width.
        this.container.style.width = `${
            this.CARD_WIDTH + this.STRIDE * (articles.length - 1) + this.hoverShift() + this.HOVER_GAP
        }px`;
        this.setupEventListeners();
    }

    // Enough shift to uncover the whole hovered card, plus a small gap.
    hoverShift() {
        return this.CARD_WIDTH - this.STRIDE + this.HOVER_GAP;
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
                    <img src="${article.icon}" alt="">
                </div>
                <span class=md-medium>${article.category}</span>
            </div>
            <div class="card-content">
                <h3 class="card-title sub-heading" style="text-transform:capitalize">${article.title}</h3>
                ${article.description ? `<p class="card-description md-medium">${article.description}</p>` : ''}
            </div>
        `;

        return card;
    }

    calculateCardPosition(index) {
        return this.STRIDE * index;
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
                    this.calculateCardPosition(index) + this.hoverShift()
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
        img: "../public/sh_case-1400.webp",
        main: ["NFT Marketplace", "Decentralized Exchange", "Staking and Governance", "DAO and Community"],
        audience: ["Crypto Investors", "Developers", "Traders"],
        format: ["Web App", "Mobile Web App"],
        scope: ["Discovery", "User Experience", "Development", "Marketing"],
        link: "https://beta.seekhype.io/",
        description: "SeekHype is an innovative platform for discovering and trading trending NFTs, designed to make the NFT space accessible to Web2 users. It offers a user-friendly interface and seamless integration with Aura Network, ensuring secure and transparent transactions. SeekHype empowers creators, collectors, and investors by bridging the digital and physical worlds, enabling ownership of unique IRL NFTs like artwork, merchandise, and experiences"
    },
    Scan: {
        img: "../public/sc_cover-1400.webp",
        main: ["Security Audit", "Transaction Verification", "Smart Contract Analysis"],
        audience: ["Blockchain Developers", "Security Analysts"],
        format: ["Web App", "Mobile Web App"],
        scope: ["User Interface", "User Experience", "Optimization"],
        link: "https://aurascan.io/",
        description: "Scan is a blockchain explorer focused on tracking transactions and analyzing smart contracts. It provides essential tools for blockchain developers and security analysts to audit security, verify transactions, and optimize smart contract functionality. With an emphasis on user experience and interface optimization, Scan simplifies complex blockchain data for its users"
    },
    Swap: {
        img: "../public/sw_case-1400.webp",
        main: ["Token Swapping", "Liquidity Pools", "Yield Farming"],
        audience: ["DeFi Users", "Liquidity Providers"],
        format: ["Web App", "Mobile Web App"],
        scope: ["Branding", "Discovery", "User Experience", "Development", "Marketing"],
        link: "https://auraswap.io/",
        description: "Swap facilitates seamless token exchanges across multiple blockchain networks. It supports token swapping, liquidity pools, and yield farming, making it ideal for DeFi users and liquidity providers. The platform prioritizes branding, user experience, and development to enhance accessibility for decentralized finance enthusiasts"
    },
    Safe: {
        img: "../public/sf_cover-1400.webp",
        main: ["Digital Wallet", "Multi-Signature Support", "Secure Storage"],
        audience: ["Crypto Holders", "Institutional Investors"],
        format: ["Web App", "Mobile Web App"],
        scope: ["User Interface", "User Experience", "Optimization"],
        link: "https://pyxis.aura.network/",
        description: "Safe offers secure storage solutions for digital assets through its digital wallet with multi-signature support. Tailored for crypto holders and institutional investors, Safe ensures optimal security while enhancing user interface and experience across web and mobile platforms"
    },
    Bot: {
        img: "../public/ab_cover-1400.webp",
        main: ["Digital Wallet", "Multi-Signature Support", "Secure Storage"],
        audience: ["Crypto Holders", "Institutional Investors"],
        format: ["Web App", "Mobile Web App"],
        scope: ["Security Enhancement", "User Privacy", "Cross-Platform Development"],
        link: "https://x.com/BBBnat1on",
        description: "Bot is a toolkit designed for developers working on the Aura Network. It focuses on enhancing security, user privacy, and cross-platform development to provide robust solutions for building blockchain applications"
    },
    Box: {
        img: "../public/sh_case-1400.webp",
        main: ["Digital Wallet", "Multi-Signature Support", "Secure Storage"],
        audience: ["Crypto Holders", "Institutional Investors"],
        format: ["Web App", "Mobile Web App"],
        scope: ["Security Enhancement", "User Privacy", "Cross-Platform Development"],
        link: "https://box.aura.network/",
        description: "Dev is a toolkit for developers building on the Aura Network."
    },
    Index: {
        img: "../public/sh_case-1400.webp",
        main: ["Crypto Index Funds", "Automated Portfolio", "Market Analysis"],
        audience: ["Passive Investors", "Portfolio Managers"],
        format: ["Web App", "Mobile Web App"],
        scope: ["Financial Research", "Automated Trading", "Performance Tracking"],
        link: "https://horoscope.aura.network/",
        description: "Index provides comprehensive analytics for blockchain data through crypto index funds, automated portfolio management, and market analysis. Designed for passive investors and portfolio managers, it focuses on financial research, automated trading strategies, and performance tracking to optimize investment decisions"
    }
};

/* Showcase image loading: the fade-in waits for the image to decode, so the
   box is never shown empty while bytes are still arriving. Other panels are
   prefetched on idle and on button hover, so later clicks resolve from
   cache. */

const imageCache = new Map();

// Resolves once the bytes are decoded and safe to paint.
function preloadImage(src) {
    if (imageCache.has(src)) return imageCache.get(src);

    const p = new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        const done = () => resolve(src);
        // decode() gives us "ready to paint" rather than merely "downloaded".
        if (img.decode) {
            img.decode().then(done).catch(done); // a failed decode still resolves
        } else {
            img.onload = done;
            img.onerror = done;
        }
    });

    imageCache.set(src, p);
    return p;
}

// Warm every other panel without competing with the visible one.
function prefetchShowcaseImages() {
    const srcs = [...new Set(Object.values(contentMap).map((d) => d.img))];
    srcs.forEach((src) => preloadImage(src));
}

// Guards against a stale response painting over a newer selection when the
// visitor clicks through the buttons quickly.
let showcaseRequestId = 0;

function loadContent(key, shouldScroll = false) {
    const data = contentMap[key];
    if (!data) return;

    const descriptionElement = document.getElementById("casedescription");
    const displayImage = document.getElementById("displayImage");
    const factCard = document.getElementById("showCaseDetail");
    if (!descriptionElement || !displayImage || !factCard) return;

    const requestId = ++showcaseRequestId;

    // Button state and CTA update immediately — they cost nothing and give the
    // click instant feedback even if the image needs a moment.
    updateActiveButton(key);
    const ctaButton = document.getElementById("ctaButton");
    if (ctaButton) ctaButton.href = data.link;

    descriptionElement.style.transition = "opacity 0.3s";
    displayImage.style.transition = "opacity 0.3s";
    factCard.style.transition = "opacity 0.3s";
    descriptionElement.style.opacity = 0;
    displayImage.style.opacity = 0;
    factCard.style.opacity = 0;

    // Text swaps on the fade-out; the image waits for its decode.
    const faded = new Promise((resolve) => setTimeout(resolve, 300));

    Promise.all([faded, preloadImage(data.img)]).then(() => {
        if (requestId !== showcaseRequestId) return; // superseded by a later click

        descriptionElement.textContent = data.description || "Description not available.";
        displayImage.src = data.img;
        displayImage.alt = data.alt || key + " showcase";

        updateList("fact-main", data.main);
        updateList("fact-audience", data.audience);
        updateList("fact-format", data.format);
        updateList("fact-scope", data.scope);

        descriptionElement.style.opacity = 1;
        displayImage.style.opacity = 1;
        factCard.style.opacity = 1;
    });
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

// Selection is carried by aria-pressed (these are toggle buttons, not
// links), with .is-active as a parallel styling hook.
function updateActiveButton(selectedKey) {
    const buttons = document.querySelectorAll(".button-group button");
    buttons.forEach(button => {
        const match = /loadContent\('([^']+)'/.exec(button.getAttribute("onclick") || "");
        const isActive = !!match && match[1] === selectedKey;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
}

// Load default content on page load WITHOUT scrolling.
// Runs on DOMContentLoaded rather than window.onload so the first panel isn't
// waiting on every third-party script and image on the page to finish.
function initShowcase() {
    if (!document.getElementById("displayImage")) return; // not a showcase page

    // The first panel is whichever pill the markup marks pressed, so the
    // page's own button order decides it.
    const pressed = document.querySelector('.button-group button[aria-pressed="true"]') ||
        document.querySelector(".button-group button");
    const first = pressed && /loadContent\('([^']+)'/.exec(pressed.getAttribute("onclick") || "");
    loadContent(first ? first[1] : "SeekHype", false);

    // Hovering a button is a strong signal of intent — warm that panel now so
    // the click itself is instant.
    document.querySelectorAll(".button-group button").forEach((button) => {
        const match = /loadContent\('([^']+)'/.exec(button.getAttribute("onclick") || "");
        if (!match) return;
        const entry = contentMap[match[1]];
        if (!entry) return;
        const warm = () => preloadImage(entry.img);
        button.addEventListener("mouseenter", warm, { once: true });
        button.addEventListener("focus", warm, { once: true });
    });

    // Belt and braces: warm everything once the browser is idle. ~390KB total
    // for the four panels the visitor hasn't seen yet.
    const warmAll = () => prefetchShowcaseImages();
    if ("requestIdleCallback" in window) {
        requestIdleCallback(warmAll, { timeout: 3000 });
    } else {
        setTimeout(warmAll, 1500);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShowcase);
} else {
    initShowcase();
}




//This is for the carosell on the case study page//

const featureSections = [
    {
        id: "tool",
        title: "Tools",
        description: "Leverage the right set of tools to enhance collaboration, streamline project management, and ensure seamless communication. By integrating industry-leading platforms, teams can work more efficiently and stay aligned.",
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
        id: "process",
        title: "Process",
        description: "A well-structured process is key to delivering high-quality outcomes. By following agile methodologies, teams can adapt quickly, improve collaboration, and continuously refine their workflows.",
        ssubtext: "Customize Process", // Add subtext here
        features: [
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>',
                text: "Discovery & Research - Understand user needs and project requirements.",
                image: "/api/placeholder/500/400",
                alt: "Discovery & Research"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>',
                text: "Design Thinking - Craft user-centric solutions through iterative design.",
                image: "/api/placeholder/500/400",
                alt: "Design Thinking"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
                text: "Planning and Implementation - Strategize execution and bring ideas to life.",
                image: "/api/placeholder/500/400",
                alt: "Planning and Implementation"
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
                text: "Design System Review - Ensure consistency and scalability in UI/UX.",
                image: "/api/placeholder/500/400",
                alt: "Design System Review"
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