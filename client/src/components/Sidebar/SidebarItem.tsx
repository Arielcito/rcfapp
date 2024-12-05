import React from "react";
import Link from "next/link";

interface SidebarItemProps {
  item: {
    icon: React.ReactNode;
    label: string;
    route: string;
  };
  pageName: string;
  setPageName: (name: string) => void;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  pageName,
  setPageName,
  isCollapsed,
}) => {
  const isActive = pageName === item.label.toLowerCase();

  return (
    <li>
      <Link
        href={item.route}
        className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
          isActive && "bg-graydark dark:bg-meta-4"
        }`}
        onClick={() => setPageName(item.label.toLowerCase())}
      >
        <div className={isCollapsed ? "w-full flex justify-center" : ""}>
          {item.icon}
        </div>
        {!isCollapsed && <span>{item.label}</span>}
        {isCollapsed && (
          <span className="absolute left-full top-1/2 ml-1 -translate-y-1/2 rounded bg-black px-2 py-1 text-xs font-medium text-white opacity-0 group-hover:opacity-100">
            {item.label}
          </span>
        )}
      </Link>
    </li>
  );
};

export default SidebarItem;
