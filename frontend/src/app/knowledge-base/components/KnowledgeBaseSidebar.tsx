"use client";

import Link from "next/link";
import { Avatar } from "@/ui/components/Avatar";
import { IconButton } from "@/ui/components/IconButton";
import { SidebarWithSections } from "@/ui/components/SidebarWithSections";
import {
  FeatherDatabase,
  FeatherLayoutDashboard,
  FeatherLayers,
  FeatherMessageSquare,
  FeatherMoreHorizontal,
  FeatherSettings,
  FeatherZap,
} from "@subframe/core";

export function KnowledgeBaseSidebar() {
  return (
    <SidebarWithSections
      className="h-auto w-72 flex-none self-stretch"
      header={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-brand-600">
            <FeatherZap className="text-caption-bold font-caption-bold text-neutral-0" />
          </div>
          <span className="text-body-bold font-body-bold text-default-font">
            RAG LMX
          </span>
        </div>
      }
      footer={
        <>
          <div className="flex grow shrink-0 basis-0 items-center gap-2">
            <Avatar>A</Avatar>
            <div className="flex flex-col items-start">
              <span className="text-caption-bold font-caption-bold text-default-font">
                Alex Morgan
              </span>
              <span className="text-caption font-caption text-subtext-color">
                Admin
              </span>
            </div>
          </div>
          <IconButton
            size="small"
            icon={<FeatherMoreHorizontal />}
            onClick={() => {}}
          />
        </>
      }
    >
      <Link href="/" className="contents">
        <SidebarWithSections.NavItem icon={<FeatherMessageSquare />} selected={false}>
          Chat
        </SidebarWithSections.NavItem>
      </Link>

      <Link href="/knowledge-base" className="contents">
        <SidebarWithSections.NavItem
          icon={<FeatherDatabase />}
          selected={true}
        >
          Knowledge Base
        </SidebarWithSections.NavItem>
      </Link>


      <SidebarWithSections.NavItem icon={<FeatherSettings />} selected={false}>
        Settings
      </SidebarWithSections.NavItem>


      <SidebarWithSections.NavItem
        icon={<FeatherLayoutDashboard />}
        selected={false}
      >
        Admin
      </SidebarWithSections.NavItem>


    </SidebarWithSections>
  );
}
