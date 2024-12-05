import React from "react";
import Link from "next/link";
import Image from "next/image";
import FooterBottom from "@/components/Footer/FooterBottom";
import { FooterMenu } from "@/types/footerMenu";

const footerNavData: FooterMenu[] = [
  {
    title: "Home",
    navItems: [
      {
        label: "Product",
        route: "#",
      },
      {
        label: "Pricing",
        route: "#",
      },
      {
        label: "Business",
        route: "#",
      },
      {
        label: "Enterprise",
        route: "#",
      },
    ],
  },
  {
    title: "About Us",
    navItems: [
      {
        label: "Company",
        route: "#",
      },
      {
        label: "Leadership",
        route: "#",
      },
      {
        label: "Careers",
        route: "#",
      },
      {
        label: "Diversity",
        route: "#",
      },
    ],
  },
  {
    title: "Resources",
    navItems: [
      {
        label: "Andy Guide",
        route: "#",
      },
      {
        label: "Forum",
        route: "#",
      },
      {
        label: "Support",
        route: "#",
      },
      {
        label: "App Directory",
        route: "#",
      },
    ],
  },
  {
    title: "Tutorial",
    navItems: [
      {
        label: "10 Leadership Styles",
        route: "#",
      },
      {
        label: "Executive Summary Tips",
        route: "#",
      },
      {
        label: "Prevent Team Burnout",
        route: "#",
      },
      {
        label: "What are OKRs?",
        route: "#",
      },
    ],
  },
];

const Footer = () => {
  return (
    <>
      <footer>
        <div className="bg-[#F8FAFB] pb-[46px] pt-[95px] dark:bg-[#15182A]">
          <div className="container max-w-[1390px]">
            <div className="-mx-4 flex flex-wrap">
              <div className="w-full px-4 lg:w-4/12 xl:w-5/12">
                <div className="mb-11 max-w-[320px]">
                  <Link href="/" className="mb-8 inline-block">
                    <Image
                      width={50}
                      height={34}
                      src={"/images/logo/logo.png"}
                      alt="Logo"
                      priority
                      className="block max-w-full dark:hidden"
                      style={{ width: "100px", height: "100px" }}
                    />
                    <Image
                      width={50}
                      height={34}
                      src={"/images/logo/logo-white.png"}
                      alt="Logo"
                      priority
                      className="hidden max-w-full dark:block"
                      style={{ width: "100px", height: "100px" }}
                    />
                  </Link>
                  <p className="text-base text-body">
                    This membership will help you plan and execute a variety of
                    projects.
                  </p>
                </div>
              </div>

              <div className="w-full px-4 lg:w-8/12 xl:w-7/12">
                <div className="-mx-4 flex flex-wrap">
                  {footerNavData.map((group, groupIndex) => (
                    <div
                      key={groupIndex}
                      className={`w-full px-4 sm:w-1/2 md:w-2/12 lg:w-2/12 ${groupIndex === 0 ? "md:w-2/12 lg:w-2/12" : groupIndex === 3 ? "md:w-4/12 lg:w-4/12" : "md:w-3/12 lg:w-3/12"}`}
                    >
                      <div className="mb-11">
                        <h3 className="mb-8 text-[22px] font-medium text-black dark:text-white">
                          {group.title}
                        </h3>

                        <ul className="space-y-[10px]">
                          {group.navItems &&
                            group.navItems.map((item, index) => (
                              <li key={index}>
                                <Link
                                  href={item.route}
                                  className="inline-block text-base text-body hover:text-primary"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <FooterBottom />
      </footer>
    </>
  );
};

export default Footer;
