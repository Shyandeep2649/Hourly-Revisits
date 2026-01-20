import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black/90 backdrop-blur border-t border-white/10 pt-10 pb-6 mt-12 relative z-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Contact Person */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 text-brand-purple">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <h4 className="font-orbitron font-bold text-white text-lg">Shyandeep Roy Chowdhury</h4>
                        <p className="text-gray-400 font-exo text-sm">BD Head</p>
                    </div>

                    {/* Get In Touch */}
                    <div className="flex flex-col items-center text-center">
                        <h4 className="font-orbitron font-bold text-white text-lg mb-4">Get In Touch</h4>
                        <a href="mailto:shyandeep.chowdhury@netambit.net" className="text-gray-400 hover:text-brand-red transition-colors font-exo text-sm mb-2 flex items-center gap-2">
                             <span className="opacity-50">✉</span> shyandeep.chowdhury@netambit.net
                        </a>
                        <a href="tel:+918376864013" className="text-gray-400 hover:text-brand-blue transition-colors font-exo text-sm mb-2 flex items-center gap-2">
                            <span className="opacity-50">📞</span> +91-8376864013
                        </a>
                        <p className="text-gray-500 text-xs">Mon-Fri, 9AM - 6:30PM</p>
                    </div>

                    {/* Location */}
                    <div className="flex flex-col items-center md:items-end text-center md:text-right">
                         <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 text-brand-emerald">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <address className="not-italic text-gray-400 font-exo text-sm">
                            C-17/2, 4th Floor<br />
                            Sector-15 B<br />
                            Noida – 201301
                        </address>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-6 text-center">
                    <p className="text-gray-600 text-xs font-exo">© 2026 Business Development Analytics Dashboard. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;