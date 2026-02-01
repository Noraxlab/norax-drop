import { motion } from "framer-motion";

export function SeoContent() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 1 }}
      className="max-w-3xl mx-auto mt-24 text-muted-foreground prose prose-invert prose-p:leading-relaxed"
    >
      <div className="border-t border-white/5 pt-16">
        <h2 className="text-2xl font-display text-white mb-6">Why Secure File Sharing Matters</h2>
        <p className="mb-4">
          In today's digital age, protecting your data is more critical than ever. 
          Our secure file transfer protocol ensures that your sensitive documents remain private 
          during transit. We utilize end-to-end encryption standards to prevent unauthorized access.
        </p>
        <p className="mb-8">
          Whether you're sharing corporate documents, creative assets, or personal files, 
          the integrity of your data is our top priority. Our verification system adds an 
          essential layer of security, filtering out automated bots and ensuring only human 
          recipients can access the download links.
        </p>

        <h3 className="text-xl font-display text-white mb-4">How Verification Protects You</h3>
        <p className="mb-4">
          The multi-step verification process you are currently navigating is designed to:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-8">
          <li>Prevent automated scraping of sensitive links</li>
          <li>Reduce server load from malicious bot traffic</li>
          <li>Ensure fair usage policy compliance</li>
          <li>Maintain high-speed download bandwidth for verified users</li>
        </ul>

        <h3 className="text-xl font-display text-white mb-4">Tips for Safe Downloading</h3>
        <p className="mb-4">
          Always verify the source of your files. Check that the URL matches the expected domain. 
          Use updated antivirus software to scan all downloaded content. If you encounter any 
          suspicious activity, report the link immediately to our support team.
        </p>
      </div>
    </motion.div>
  );
}
