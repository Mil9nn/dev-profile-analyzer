import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useState } from "react"
import { axiosInstance } from '../lib/axios.ts'

// ----------------------
// Schema Validation
// ----------------------
const formSchema = z.object({
    jobTitle: z.string().min(2, {
        message: "Job title is required.",
    }),
    githubProfile: z
        .string()
        .url("Invalid GitHub URL")
        .optional()
        .or(z.literal("")),
    linkedinProfile: z
        .string()
        .url("Invalid LinkedIn URL")
        .optional()
        .or(z.literal("")),
    repositories: z
        .array(z.string().url("Invalid repository URL").optional().or(z.literal("")))
        .refine(
            (repos) => repos.filter((repo) => repo && repo.trim() !== "").length >= 1,
            { message: "At least one repository is required." }
        ),
})

// ----------------------
// Response Type - Updated to match backend
// ----------------------
type AnalyzeResponse = {
    success: boolean;
    aiFeedback: {
        score: number | null;
        rationale: string[];
        technologies: string[];
        strengths: string[];
        weaknesses: string[];
        improvements: string[];
        hiringPotential: {
            level: string;
            details: string;
            watchAreas: string[];
        };
        conclusion: string;
    };
}

export function ProfileForm() {
    const [result, setResult] = useState<AnalyzeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            jobTitle: "",
            githubProfile: "",
            linkedinProfile: "",
            repositories: ["", "", ""],
        },
    })

    // ----------------------
    // Handle Submit
    // ----------------------
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await axiosInstance.post<AnalyzeResponse>('/analyze', values);
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    // Helper function to safely check if array exists and has content
    const hasContent = (arr: any): arr is string[] => {
        return Array.isArray(arr) && arr.length > 0;
    };

    // Helper function to safely get array or empty array
    const safeArray = (arr: any): string[] => {
        return Array.isArray(arr) ? arr : [];
    };

    return (
        <div className="p-4">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 max-w-[400px] p-4 shadow-lg border border-gray-200 rounded-md"
                >
                    {/* Job Title */}
                    <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Backend Developer" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Github Profile */}
                    <FormField
                        control={form.control}
                        name="githubProfile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GitHub Profile</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://github.com/username" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* LinkedIn Profile */}
                    <FormField
                        control={form.control}
                        name="linkedinProfile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>LinkedIn Profile</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://linkedin.com/in/username" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Repositories */}
                    {form.watch("repositories").map((_, index) => (
                        <FormField
                            key={index}
                            control={form.control}
                            name={`repositories.${index}` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Repository {index + 1}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://github.com/user/repo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}

                    <Button type="submit" disabled={loading}>
                        {loading ? "Analyzing..." : "Submit"}
                    </Button>
                </form>
            </Form>

            {/* ---------------------- */}
            {/* Results Section */}
            {/* ---------------------- */}
            <section className="mt-6">
                {loading && <p className="text-sm text-gray-500">Analyzing repositories...</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}
                {result?.aiFeedback && (
                    <div className="p-6 border rounded-md text-black bg-gray-50 mt-4 space-y-6 max-w-4xl">
                        {/* Score Section */}
                        {result.aiFeedback.score !== null && result.aiFeedback.score !== undefined && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Overall Score</h3>
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                    {result.aiFeedback.score}/10
                                </div>
                                {hasContent(result.aiFeedback.rationale) && (
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Rationale:</h4>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {safeArray(result.aiFeedback.rationale).map((item, index) => (
                                                <li key={index} className="text-sm text-gray-600">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Technologies Section */}
                        {hasContent(result.aiFeedback.technologies) && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Technologies & Frameworks</h3>
                                <div className="flex flex-wrap gap-2">
                                    {safeArray(result.aiFeedback.technologies).map((tech, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Strengths Section */}
                        {hasContent(result.aiFeedback.strengths) && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-green-700 mb-3">Strengths</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    {safeArray(result.aiFeedback.strengths).map((strength, index) => (
                                        <li key={index} className="text-sm text-gray-700">{strength}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Weaknesses Section */}
                        {hasContent(result.aiFeedback.weaknesses) && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-red-700 mb-3">Areas for Improvement</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    {safeArray(result.aiFeedback.weaknesses).map((weakness, index) => (
                                        <li key={index} className="text-sm text-gray-700">{weakness}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Improvements Section */}
                        {hasContent(result.aiFeedback.improvements) && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-purple-700 mb-3">Suggested Improvements</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    {safeArray(result.aiFeedback.improvements).map((improvement, index) => (
                                        <li key={index} className="text-sm text-gray-700">{improvement}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Hiring Potential Section */}
                        {result.aiFeedback.hiringPotential?.level && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-indigo-700 mb-3">Hiring Potential</h3>
                                <div className="mb-3">
                                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                                        {result.aiFeedback.hiringPotential.level}
                                    </span>
                                </div>
                                {result.aiFeedback.hiringPotential.details && (
                                    <p className="text-sm text-gray-700 mb-3">{result.aiFeedback.hiringPotential.details}</p>
                                )}
                                {hasContent(result.aiFeedback.hiringPotential.watchAreas) && (
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Areas to Watch:</h4>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {safeArray(result.aiFeedback.hiringPotential.watchAreas).map((area, index) => (
                                                <li key={index} className="text-sm text-gray-600">{area}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Conclusion Section */}
                        {result.aiFeedback.conclusion && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Conclusion</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">{result.aiFeedback.conclusion}</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}