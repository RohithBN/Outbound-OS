"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, ThemeToggle } from "@/components/ui";

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RocketIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TargetIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const STEPS = [
  { id: 1, name: "Profile", description: "Personal details", icon: UserIcon },
  { id: 2, name: "Skills", description: "Experience & Tech", icon: BriefcaseIcon },
  { id: 3, name: "Preferences", description: "Job requirements", icon: SettingsIcon },
];

export default function TalentRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    location: "",
    bio: "",
    experience_years: "",
    skills: "",
    current_company: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    expected_salary_min: "",
    expected_salary_max: "",
    work_authorization: "",
    remote_preference: "",
    availability: "",
    open_to_relocation: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
    setError("");
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.email && formData.role && formData.location && formData.bio);
      case 2:
        return !!(formData.experience_years && formData.skills);
      case 3:
        return !!(formData.work_authorization && formData.remote_preference && formData.availability);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      setError("");
    } else {
      setError("Please fill all required fields");
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) {
      setError("Please fill all required fields");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const payload = {
        ...formData,
        experience_years: parseInt(formData.experience_years),
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        expected_salary_min: formData.expected_salary_min ? parseInt(formData.expected_salary_min) : undefined,
        expected_salary_max: formData.expected_salary_max ? parseInt(formData.expected_salary_max) : undefined,
      };

      const res = await fetch("/api/talent/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Profile Created
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Your profile has been successfully registered. You will now be prioritized in our talent matching algorithm.
          </p>
          <Link href="/">
            <Button fullWidth className="group">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top duration-700">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <span className="text-xl font-bold tracking-tight">OutboundOS</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar / Progress Section */}
            <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left duration-700 delay-100">
                <div>
                   <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                     Join the Talent Network
                   </h1>
                   <p className="text-gray-500 dark:text-gray-400 text-lg">
                     Passively get matched with top companies looking for your specific skillset.
                   </p>
                </div>

                <div className="space-y-6 relative">
                    {/* Vertical line connection */}
                    <div className="absolute left-[22px] top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-800 z-0" />
                    
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        
                        return (
                            <div key={step.id} className="relative z-10 flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                                    isActive || isCompleted 
                                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25" 
                                        : "bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-gray-400"
                                }`}>
                                   <Icon className="w-6 h-6" />
                                </div>
                                <div className={`pt-2 transition-all duration-300 ${isActive ? "opacity-100 translate-x-1" : "opacity-60"}`}>
                                    <p className={`font-semibold ${isActive ? "text-orange-600 dark:text-orange-500" : "text-gray-900 dark:text-white"}`}>
                                        {step.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Main Form Section */}
            <div className="lg:col-span-8 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl">
                           <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in cursor-default">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="First Last" required />
                                    <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@company.com" required />
                                </div>
                                <Input label="Current Role" name="role" value={formData.role} onChange={handleChange} placeholder="e.g. Senior Frontend Engineer" required />
                                <Input label="Current Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. San Francisco, CA" required />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Professional Bio</label>
                                    <textarea 
                                        name="bio" 
                                        value={formData.bio} 
                                        onChange={handleChange} 
                                        placeholder="Brief summary of your professional background..." 
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white bg-transparent focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all duration-200 min-h-[120px]" 
                                        required 
                                    />
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in cursor-default">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Years of Experience" type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} placeholder="e.g. 5" min="0" required />
                                    <Input label="Current Company" name="current_company" value={formData.current_company} onChange={handleChange} placeholder="e.g. Acme Inc." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technical Skills</label>
                                    <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, TypeScript..." required />
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {formData.skills.split(',').filter(Boolean).map((skill, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Social Profiles</h3>
                                    <Input label="LinkedIn" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="linkedin.com/in/..." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="GitHub" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="github.com/..." />
                                        <Input label="Portfolio" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} placeholder="myportfolio.com" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                             <div className="space-y-6 animate-in fade-in cursor-default">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Min Salary (USD)" type="number" name="expected_salary_min" value={formData.expected_salary_min} onChange={handleChange} placeholder="120000" />
                                    <Input label="Max Salary (USD)" type="number" name="expected_salary_max" value={formData.expected_salary_max} onChange={handleChange} placeholder="180000" />
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Authorization</label>
                                    <div className="relative">
                                        <select name="work_authorization" value={formData.work_authorization} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white bg-transparent focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none appearance-none transition-all duration-200" required>
                                            <option value="" className="text-gray-500">Select status...</option>
                                            <option value="US Citizen">US Citizen</option>
                                            <option value="Green Card">Green Card</option>
                                            <option value="H1B">H1B</option>
                                            <option value="OPT">OPT</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Preference</label>
                                        <div className="relative">
                                            <select name="remote_preference" value={formData.remote_preference} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white bg-transparent focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none appearance-none transition-all duration-200" required>
                                                <option value="">Select...</option>
                                                <option value="remote">Fully Remote</option>
                                                <option value="hybrid">Hybrid</option>
                                                <option value="onsite">On-site</option>
                                                <option value="flexible">Flexible</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability</label>
                                        <div className="relative">
                                            <select name="availability" value={formData.availability} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white bg-transparent focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none appearance-none transition-all duration-200" required>
                                                <option value="">Select...</option>
                                                <option value="immediately">Immediately</option>
                                                <option value="2_weeks">2 Weeks</option>
                                                <option value="1_month">1 Month</option>
                                                <option value="3_months">3 Months</option>
                                            </select>
                                             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-orange-500/30 transition-colors cursor-pointer" onClick={() => setFormData({...formData, open_to_relocation: !formData.open_to_relocation})}>
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.open_to_relocation ? "bg-orange-500 border-orange-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"}`}>
                                    {formData.open_to_relocation && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                  </div>
                                  {/* Hidden checkbox for semantics */}
                                  <input type="checkbox" name="open_to_relocation" checked={formData.open_to_relocation} onChange={handleChange} className="hidden" />
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">Open to relocation</label>
                                </div>
                             </div>
                        )}

                        <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            {currentStep > 1 && (
                                <Button type="button" variant="outline" onClick={prevStep} className="px-8">
                                    Back
                                </Button>
                            )}
                            <Button 
                                type={currentStep === 3 ? "submit" : "button"} 
                                onClick={currentStep < 3 ? nextStep : undefined} 
                                isLoading={isSubmitting} 
                                className="flex-1"
                            >
                                {currentStep === 3 ? "Complete Registration" : "Continue"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Benefits Footer */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                    {[
                        { title: "Priority Status", desc: "Get prioritized in employer searches", icon: RocketIcon },
                        { title: "Smart Matching", desc: "AI-driven role recommendations", icon: TargetIcon },
                        { title: "Direct Contact", desc: "Employers reach you directly", icon: MessageIcon },
                    ].map((benefit, i) => {
                        const Icon = benefit.icon;
                        return (
                            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-3 text-orange-500">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{benefit.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{benefit.desc}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
