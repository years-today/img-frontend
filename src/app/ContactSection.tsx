

export default function ContactSection() {
    return (
        <section className="snap-section flex flex-col items-center justify-center py-8 relative bg-gray-850">
            <div className="max-w-xl px-4">
                <h2 className="text-3xl font-bold mb-6">Created by</h2>
                <p className="text-lg mb-6 text-center">
                    Oleg Glotov
                </p>
                <p className="text-lg mb-6 text-center">
                    Sawyer Tang
                </p>
                <div className="space-y-4">
                    <a 
                        href="mailto:img-portal@gmail.com" 
                        className="block px-6 py-3 bg-blue-500 text-white rounded-lg text-center hover:bg-blue-600 transition-colors"
                    >
                        Email Us
                    </a>
                    
                </div>
            </div>
        </section>
    );
}