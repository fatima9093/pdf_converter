'use client';

import { 
  ShieldCheck, 
  Smartphone, 
  Zap,
  Lock,
  CloudUpload,
  Cpu,
  DollarSign,
  ArrowLeftRight,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: ArrowLeftRight,
    title: 'Comprehensive Tool Collection',
    description: 'Access a wide range of PDF tools for conversion, merging, splitting, compression, and more. Everything you need for professional PDF management in one place.'
  },
  {
    icon: Zap,
    title: 'Easy to Use',
    description: 'Our tools are designed with simplicity in mind. Intuitive interface and straightforward workflow make PDF tasks effortless, even for beginners.'
  },
  {
    icon: ShieldCheck,
    title: 'Security First',
    description: 'All file transfers are encrypted. Your files are automatically deleted from our servers after processing, ensuring your documents remain private and secure.'
  },
  {
    icon: Globe,
    title: 'No Installation Required',
    description: 'Work directly in your web browser. No software downloads or installations needed. Use our tools on any device with an internet connection.'
  },
  {
    icon: Smartphone,
    title: 'Works on All Devices',
    description: 'Compatible with all modern operating systems and browsers. Whether you\'re on Windows, Mac, Linux, or mobile, our tools work seamlessly.'
  },
  {
    icon: Cpu,
    title: 'Cloud Processing',
    description: 'Files are processed on our powerful servers. Your device resources are not affected, so you can continue working while conversions happen in the background.'
  },
  {
    icon: DollarSign,
    title: 'Free to Use',
    description: 'Access all basic PDF tools completely free with generous limits. Professional features available for those who need advanced capabilities.'
  },
  {
    icon: Lock,
    title: 'Privacy Protected',
    description: 'We respect your privacy. Your files are processed securely and deleted immediately after conversion. No data is stored or shared with third parties.'
  },
  {
    icon: CloudUpload,
    title: 'Fast & Reliable',
    description: 'Quick processing times with reliable results. Our scalable infrastructure ensures consistent performance even during peak usage.'
  }
];

export default function FeaturesSection() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our PDF Tools?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional PDF solutions designed for efficiency, security, and ease of use
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-[#2b3d98]" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-700 text-lg">
            Start using our tools today and experience the difference!
          </p>
        </div>
      </div>
    </section>
  );
}

