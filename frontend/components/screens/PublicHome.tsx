"use client";
import {useRouter} from "next/navigation";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardHero from "@/components/dashboard/DashboardHero";
import FeaturedTeachers from "@/components/dashboard/FeaturedTeachers";
import FaqSection from "@/components/dashboard/FaqSection";
import InteractiveVocabulary from "@/components/dashboard/InteractiveVocabulary";
import {ClosingCallToAction,HskPathways,LearningMethod} from "@/components/dashboard/LearningSections";
import styles from "@/app/dashboard/dashboard.module.css";
export default function PublicHome(){const router=useRouter();return <><DashboardHeader onStart={()=>router.push("/onboarding")}/><main id="dashboard-main" tabIndex={-1} className={styles.page}><DashboardHero onStartLearning={()=>router.push("/lessons/1")} onOpenReview={()=>router.push("/review")}/><HskPathways/><LearningMethod/><InteractiveVocabulary/><FeaturedTeachers/><FaqSection/><ClosingCallToAction onStart={()=>router.push("/lessons/1")}/></main><DashboardFooter/></>;}
