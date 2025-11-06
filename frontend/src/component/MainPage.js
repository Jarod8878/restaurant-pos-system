import React, { useEffect, useState } from 'react';
import { Layout, Button, Typography, Carousel, Row, Col, ConfigProvider, } from 'antd';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../CSS/MainPage.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const MainPage = () => {
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderHeader = () => (
        <Header className="main-header">
            <div className="header-inner">
                {isMobile ? (
                    <div className="mobile-header-row">
                        <div className="logo">Cafe HengOngHuat</div>
                        <div className="mobile-links">
                            <Button type="link" onClick={() => navigate('/customer-login-mobile')}> Customer Login</Button>
                        </div>
                    </div>

                ) : (
                    <>
                        <div className="logo">Cafe HengOngHuat</div>
                        <div className="nav-links">
                            <Button type="link" onClick={() => navigate('/admin-login')}>Admin Login</Button>
                        </div>
                    </>
                )}
            </div>
        </Header>
    );

    const renderCarousel = () => (
        <ConfigProvider theme={{
            components: {
                Carousel: {
                    arrowSize: 40,
                    arrowOffset: 32,
                    dotHeight: 6,
                    dotWidth: 24,
                    dotGap: 8,
                },
            },
        }}>
            <div className="banner-carousel">
                <Carousel arrows autoplay autoplaySpeed={5000} effect="fade" infinite>
                    {[
                        {
                            src: "/CarouselAppleJuice.jpg",
                            title: "Quench Your Thirst",
                            desc: "Try our best-selling Apple Juice – refreshing, crisp, and made with fresh apples every day.",
                            link: "/customer-login-mobile",
                            btn: "Order Now",
                        },
                        {
                            src: "/CarouselMargheritaPizza.webp",
                            title: "Perfect for Sharing",
                            desc: "Whether it's a family night out or friends hangout, our pizzas are perfect for group gatherings.",
                            link: "/customer-login-mobile",
                            btn: "Explore Our Menu",
                        }
                    ].map((slide, i) => (
                        <div className="carousel-slide layered-slide" key={i}>
                            <div className="blurred-bg" style={{ backgroundImage: `url('${slide.src}')` }} />
                            <div className="carousel-content-container">
                                <img src={slide.src} alt={slide.title} className="carousel-product-img" />
                                <div className="carousel-text-block">
                                    <Title level={2}>{slide.title}</Title>
                                    <Paragraph>{slide.desc}</Paragraph>
                                    <Button
                                        type="primary"
                                        shape="round"
                                        size={isMobile ? 'middle' : 'large'}
                                        onClick={() => navigate(slide.link)}
                                    >
                                        {slide.btn}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>
        </ConfigProvider>
    );

    const renderStories = () => (
        <Content className="section stories-section">
            <Title level={2}>News</Title>
            <Row gutter={16} justify="center">
                {[
                    { src: '/BdayDiscountStory.png', label: 'Birthday Discount' },
                    { src: '/PointRedemptionStory.png', label: 'Point Redemption' },
                    { src: '/ValentineVoucherStory.png', label: 'Valentine Voucher' },
                    { src: '/NewItemStory.png', label: 'Salted Egg Pasta' },
                ].map((story, index) => (
                    <Col key={index}>
                        <div className="story-card">
                            <img src={story.src} className="story-image" alt={story.label} />
                            <Paragraph style={{ marginTop: '12px' }}>
                                {story.label}
                            </Paragraph>
                        </div>
                    </Col>
                ))}
            </Row>
        </Content>
    );

    const renderFooter = () => (
        <Footer className="footer-section">
            <div className="footer-columns">
                <div>
                    <h4>Follow Us</h4>
                    <ul>
                        <li>
                            <i className="fab fa-instagram" style={{ marginRight: '8px', color: '#E1306C', fontSize: '20px' }}></i>
                            <a href="https://www.instagram.com/jarod_lim/" target="_blank" rel="noopener noreferrer">
                                jarod_lim
                            </a>
                        </li>
                        <li>
                            <i className="fab fa-facebook" style={{ marginRight: '8px', color: '#3b5998', fontSize: '20px' }}></i>
                            <a href="https://www.facebook.com/jarod.lim.52/" target="_blank" rel="noopener noreferrer">
                                JarodLim
                            </a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4>Contact Us</h4>
                    <ul>
                        <li>
                            <a href="mailto:jarodlimjw@1utar.edu.my">
                                Email: jarodlimjw@1utar.edu.my
                            </a>
                        </li>
                        <li>
                            <a href="tel:+60196168878">
                                Phone: +60 19-6168878
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <span>© 2025 Cafe HengOngHuat</span>
            </div>
        </Footer>
    );

    return (
        <Layout className="main-layout">
            {renderHeader()}
            {renderCarousel()}
            {renderStories()}
            {renderFooter()}
        </Layout>
    );
};

export default MainPage;
