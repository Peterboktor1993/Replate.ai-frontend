"use client";
import ContactForm from "@/components/contact/ContactForm";

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions or need assistance? We're here to help! Fill out the
          form below or use our contact information to reach out.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Get in Touch
            </h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <i className="fas fa-map-marker-alt text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Our Location
                  </h3>
                  <p className="mt-1 text-gray-600">
                    123 Business Street
                    <br />
                    New York, NY 10001
                    <br />
                    United States
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <i className="fas fa-phone text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                  <p className="mt-1 text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <i className="fas fa-envelope text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Email</h3>
                  <p className="mt-1 text-gray-600">support@carvio.com</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Business Hours
              </h3>
              <div className="space-y-2 text-gray-600">
                <p>
                  <i className="far fa-clock mr-2"></i>Monday - Friday: 9:00 AM
                  - 6:00 PM
                </p>
                <p>
                  <i className="far fa-clock mr-2"></i>Saturday: 10:00 AM - 4:00
                  PM
                </p>
                <p>
                  <i className="far fa-clock mr-2"></i>Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
