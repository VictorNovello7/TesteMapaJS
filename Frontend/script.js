document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. Mobile Menu Toggler
       ========================================== */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    /* ==========================================
       2. Hero Slider (Carrossel)
       ========================================== */
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const slideIntervalTime = 6000; // 6 seconds
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function startSlideShow() {
        slideInterval = setInterval(nextSlide, slideIntervalTime);
    }

    function resetSlideShow() {
        clearInterval(slideInterval);
        startSlideShow();
    }

    const prevArrow = document.getElementById('prev-arrow');
    const nextArrow = document.getElementById('next-arrow');

    if (slides.length > 0 && dots.length > 0) {
        // Dot Navigation
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                showSlide(idx);
                resetSlideShow();
            });
        });

        // Arrow Navigation
        if (prevArrow && nextArrow) {
            prevArrow.addEventListener('click', () => {
                let prev = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(prev);
                resetSlideShow();
            });

            nextArrow.addEventListener('click', () => {
                nextSlide();
                resetSlideShow();
            });
        }

        startSlideShow();
    }

    /* ==========================================
       3. Products Tab Switcher
       ========================================== */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const productContainerBg = document.getElementById('products-container-bg');
    const productTitle = document.getElementById('product-title');
    const productDesc = document.getElementById('product-desc');
    const mockupBottles = document.getElementById('mockup-bottles');
    const realProductImg = document.getElementById('real-product-img');

    // Data for each product tab
    const productsData = {
        'mascara': {
            title: 'RESCUE MÁSCARA CAPILAR',
            desc: 'A Máscara Capilar Rescue Wade Brasil foi desenvolvida com ativos de alta performance para promover uma hidratação ultra profunda. Penetra no córtex capilar, repondo massa, selando as cutículas e restaurando a elasticidade natural dos fios desde a primeira aplicação.',
            bg: 'hsl(180, 41%, 53%)', // Deep Pinkish Purple
            imageSrc: 'imgs/mascara_novo.png', // Uses tall cosmetic bottle
            styleClass: 'mascara-style',
            bottleColors: {
                primary: 'linear-gradient(180deg, #ffffff 0%, #f7e6f0 100%)',
                secondary: 'linear-gradient(180deg, #fcebf4 0%, #ecc8db 100%)',
                primaryLabelBrand: 'hsl(329, 45%, 45%)',
                secondaryLabelBrand: 'hsl(261, 46%, 40%)'
            }
        },
        'lava-roupas': {
            title: 'LAVA ROUPAS ENZIMÁTICO',
            desc: 'O BlueSafe Lava Roupas Enzimático é um detergente líquido desenvolvido com tecnologia enzimática de alta performance, proporcionando uma limpeza profunda e eficiente para diferentes tipos de tecidos. Sua fórmula avançada atua diretamente na remoção de sujeiras e manchas, preservando as cores e a qualidade das roupas mesmo após diversas lavagens.',
            bg: 'hsl(261, 41%, 42%)', // Purple
            imageSrc: 'imgs/produto 1.png', // BlueSafe bottles
            styleClass: 'laundry-style',
            bottleColors: {
                primary: 'linear-gradient(180deg, #ffffff 0%, #f0f4f8 100%)',
                secondary: 'linear-gradient(180deg, #eceff3 0%, #cfd7df 100%)',
                primaryLabelBrand: '#1a2b49',
                secondaryLabelBrand: 'hsl(261, 46%, 40%)'
            }
        },
        'shampoo': {
            title: 'RESCUE SHAMPOO',
            desc: 'O Rescue Shampoo Wade Brasil limpa suavemente o couro cabeludo e os fios, removendo as impurezas sem ressecar. Sua fórmula nutritiva prepara o cabelo para receber o tratamento completo, estimulando a circulação e promovendo brilho, maciez e força desde a raiz.',
            bg: 'hsl(180, 41%, 53%)', 
            imageSrc: 'imgs/shampoo_novo.png', // Uses tall cosmetic bottle
            styleClass: 'shampoo-style',
            bottleColors: {
                primary: 'linear-gradient(180deg, #ffffff 0%, #e6f5f0 100%)',
                secondary: 'linear-gradient(180deg, #ebfcee 0%, #c8ecd0 100%)',
                primaryLabelBrand: 'hsl(170, 46%, 40%)',
                secondaryLabelBrand: 'hsl(261, 46%, 40%)'
            }
        },
        'condicionador': {
            title: 'RESCUE CONDICIONADOR',
            desc: 'O Rescue Condicionador Wade Brasil foi desenvolvido para proporcionar uma nutrição intensa aos cabelos, restaurando a maciez, o brilho e a resistência dos fios desde a primeira aplicação. Sua fórmula exclusiva combina ingredientes de alta performance que atuam profundamente na fibra capilar, promovendo hidratação duradoura e proteção contra os danos do dia a dia.',
            bg: 'hsl(261, 41%, 42%)', 
            imageSrc: 'imgs/produto 2.png', // Rescue Conditioner bottles
            styleClass: 'conditioner-style',
            bottleColors: {
                primary: 'linear-gradient(180deg, #ffffff 0%, #e6eff5 100%)',
                secondary: 'linear-gradient(180deg, #e1f0f0 0%, #c4e1e1 100%)',
                primaryLabelBrand: 'hsl(261, 46%, 40%)',
                secondaryLabelBrand: 'hsl(180, 54%, 49%)'
            }
        },
        'outros': {
            title: 'OUTRAS LINHAS DE CUIDADO',
            desc: 'Explore nossa linha completa de cuidados especiais para você e seu lar. Desenvolvemos soluções ecológicas de alta performance para limpeza geral, cuidados com a pele, sabonetes líquidos e aromatizadores de ambientes, sempre alinhando tecnologia, eficácia e sustentabilidade.',
            bg: 'hsl(218, 20%, 38%)', // Slate Grey
            imageSrc: 'imgs/produto 1.png', // Fallback to laundry style shape
            styleClass: 'outros-style',
            bottleColors: {
                primary: 'linear-gradient(180deg, #ffffff 0%, #f0f1f3 100%)',
                secondary: 'linear-gradient(180deg, #eaebed 0%, #d5d7dc 100%)',
                primaryLabelBrand: 'hsl(218, 20%, 38%)',
                secondaryLabelBrand: 'hsl(180, 54%, 49%)'
            }
        }
    };

    function switchProduct(tabName) {
        const data = productsData[tabName];
        if (!data) return;

        // Apply dynamic fade animation
        const flexContainer = document.querySelector('.products-flex');
        flexContainer.style.opacity = '0';
        flexContainer.style.transform = 'translateY(15px)';

        setTimeout(() => {
            // Update Text
            productTitle.innerText = data.title;
            productDesc.innerText = data.desc;

            // Update Background Color
            productContainerBg.style.backgroundColor = data.bg;

            // Attempt to load real image, fallback to beautiful CSS bottles
            const img = new Image();
            img.src = data.imageSrc;
            img.onload = () => {
                realProductImg.src = data.imageSrc;
                realProductImg.classList.remove('hidden');
                mockupBottles.classList.add('hidden');
            };
            img.onerror = () => {
                // Image not found/ready, format and colorize the beautiful mockup bottles
                realProductImg.classList.add('hidden');
                mockupBottles.classList.remove('hidden');

                // Clear previous classes and apply new one
                mockupBottles.className = 'mockup-bottles ' + data.styleClass;

                // Colorize the bottles
                const pBottle = mockupBottles.querySelector('.bottle-primary');
                const sBottle = mockupBottles.querySelector('.bottle-secondary');

                if (pBottle && sBottle) {
                    pBottle.style.background = data.bottleColors.primary;
                    sBottle.style.background = data.bottleColors.secondary;

                    const pBrand = pBottle.querySelector('.label-brand');
                    const sBrand = sBottle.querySelector('.label-brand');

                    if (pBrand) pBrand.style.color = data.bottleColors.primaryLabelBrand;
                    if (sBrand) sBrand.style.color = data.bottleColors.secondaryLabelBrand;
                }
            };

            // Trigger reflow/fade-in
            flexContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            flexContainer.style.opacity = '1';
            flexContainer.style.transform = 'translateY(0)';
        }, 300);
    }

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Verificação: Se o botão tiver a classe "link-outros" ou não tiver "data-tab", ignore a função de troca de produtos
                if (btn.classList.contains('link-outros') || !btn.dataset.tab) {
                    return; 
                }

                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                switchProduct(btn.dataset.tab);
            });
        });
        // Initial setup for default tab (lava-roupas)
        switchProduct('lava-roupas');
    }

    /* ==========================================
       4. History Timeline Selector
       ========================================== */
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineArrows = document.querySelectorAll('.timeline-arrow');
    const historyText = document.getElementById('history-dynamic-text');

    const timelineData = {
        '2018': 'O fundador estuda mercados globais e observa o lento avanço da inovação e sustentabilidade no Brasil, gerando a inquietação que daria origem à empresa.',
        '2019': 'A visão ganha forma com o nascimento da Wade e o lançamento de seus primeiros produtos focados na área de nutrição e bem-estar.',
        '2025': 'O grupo expande com a criação das marcas BeFarm e BlueSafe, além de conquistar a propriedade integral de seu aplicativo, garantindo independência tecnológica',
        '2026': 'Em 2026, inicia-se uma nova fase de desenvolvimento com a aproximação e parceria com o Biopark, um dos principais ecossistemas de inovação do Brasil. Essa união estabelece as bases estruturais para o futuro da empresa, focando em pesquisa, industrialização, desenvolvimento tecnológico, expansão sustentável e educação corporativa.'
    };

    function updateTimeline(selectedYear) {
        let activeReached = false;
        
        timelineItems.forEach((item, index) => {
            const itemYear = item.dataset.year;
            
            if (itemYear === selectedYear) {
                item.classList.add('active');
                activeReached = true;
            } else {
                item.classList.remove('active');
            }
        });

        // Highlight arrows up to the active step
        const yearsOrder = ['2017', '2019', '2020', '2023', '2024'];
        const selectedIdx = yearsOrder.indexOf(selectedYear);

        timelineArrows.forEach((arrow, idx) => {
            if (idx < selectedIdx) {
                arrow.classList.add('highlighted');
            } else {
                arrow.classList.remove('highlighted');
            }
        });

        // Update narrative text
        if (historyText) {
            historyText.style.opacity = '0';
            setTimeout(() => {
                historyText.innerText = timelineData[selectedYear];
                historyText.style.opacity = '1';
            }, 200);
        }
    }

    if (timelineItems.length > 0) {
        timelineItems.forEach(item => {
            item.addEventListener('click', () => {
                updateTimeline(item.dataset.year);
            });
        });
        
        // Initial active year styling
        updateTimeline('2019');
    }

    /* ==========================================
       5. FAQ Accordion Selector
       ========================================== */
    const faqItems = document.querySelectorAll('.faq-item');
    const faqAnswerText = document.getElementById('faq-answer-text');

    const faqData = {
        '1': 'Sim. A sustentabilidade é um dos pilares da WADE. Desde o desenvolvimento das formulas até a escolha das embalagens, buscamos soluções que minimizem os impactos ambientais sem comprometer a qualidade e a eficiência dos produtos. Nossa missão é oferecer alternativas inovadoras que contribuam para um consumo mais consciente, valorizando práticas responsáveis e alinhadas às necessidades do mundo atual. Acreditamos que é possível unir tecnologia, desempenho e respeito ao meio ambiente em cada produto que desenvolvemos.',
        '2': 'Não. A WADE é uma marca totalmente Cruelty-Free. Todos os nossos testes de segurança e eficácia são realizados utilizando métodos alternativos in vitro e modelos computacionais avançados. Garantimos o mais alto nível de respeito aos animais em todas as etapas da cadeia de suprimentos e produção dos nossos produtos de limpeza e cuidados pessoais.',
        '3': 'Os produtos WADE podem ser adquiridos em nossa loja online oficial, em grandes redes de supermercados, farmácias selecionadas e lojas de produtos naturais parceiras por todo o Brasil. Você também pode consultar o nosso localizador de lojas no site ou através do nosso aplicativo oficial para encontrar o ponto de venda mais próximo de você.',
        '4': 'Para se tornar um revendedor ou distribuidor parceiro da WADE, basta acessar a nossa área dedicada no aplicativo ou entrar em contato através do formulário comercial em nosso site. Oferecemos condições especiais de atacado, materiais de apoio para vendas e suporte exclusivo para ajudar a expandir os negócios na sua região.',
        '5': 'Sim. Todos os produtos WADE contam com instruções detalhadas de uso em seus róulos. Além disso, disponibilizamos guias completos e vídeos explicativos em nosso aplicativo oficial e canal do YouTube, garantindo que você extraia o máximo rendimento e eficiência de cada solução de forma segura.'
    };

    if (faqItems.length > 0 && faqAnswerText) {
        faqItems.forEach(item => {
            item.addEventListener('click', () => {
                faqItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Fade-in/out transition
                faqAnswerText.style.opacity = '0';
                faqAnswerText.style.transform = 'translateY(5px)';

                setTimeout(() => {
                    faqAnswerText.innerText = faqData[item.dataset.faq];
                    faqAnswerText.style.opacity = '1';
                    faqAnswerText.style.transform = 'translateY(0)';
                }, 200);
            });
        });
    }
});

const slides = document.querySelectorAll(".empresa-item");

const nextButton = document.querySelector(".empresa-next");
const prevButton = document.querySelector(".empresa-prev");

let slideAtual = 0;
let trocando = false;


function mostrarSlide(novoSlide) {

    if (trocando || novoSlide === slideAtual) {
        return;
    }

    trocando = true;

    // 1. Remove os cliques e o destaque do slide antigo
    slides[slideAtual].style.opacity = "0";
    slides[slideAtual].style.transform = "scale(1.04)";
    slides[slideAtual].style.pointerEvents = "none";
    slides[slideAtual].style.zIndex = "1";

    // 2. Ativa os cliques e exibe o novo slide
    slides[novoSlide].style.opacity = "1";
    slides[novoSlide].style.transform = "scale(1)";
    slides[novoSlide].style.pointerEvents = "auto"; // Libera os botões e links
    slides[novoSlide].style.zIndex = "2";

    slideAtual = novoSlide;

    setTimeout(() => {
        trocando = false;
    }, 800);
}


function proximoSlide() {

    let proximo = slideAtual + 1;

    if (proximo >= slides.length) {
        proximo = 0;
    }

    mostrarSlide(proximo);
}


function slideAnterior() {

    let anterior = slideAtual - 1;

    if (anterior < 0) {
        anterior = slides.length - 1;
    }

    mostrarSlide(anterior);
}


nextButton.addEventListener(
    "click",
    proximoSlide
);


prevButton.addEventListener(
    "click",
    slideAnterior
);
