import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import About from '../components/About';
import ContactForm from '../components/ContactForm';

const Home = () => {
  return (
    <div>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. About Me Section */}
      <About />

      {/* 3. Contact Section */}
      <ContactForm />
    </div>
  );
};

export default Home;
