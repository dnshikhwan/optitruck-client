import { useMatches, Link } from "@tanstack/react-router";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

export function AppBreadcrumb() {
    const matches = useMatches();

    const crumbs = matches.filter((match) => match.staticData?.breadcrumb);

    return (
        <Breadcrumb className="p-6 pb-0">
            <BreadcrumbList>
                {crumbs.map((match, index) => {
                    const isLast = index === crumbs.length - 1;

                    return (
                        <React.Fragment key={match.id}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>
                                        {match.staticData.breadcrumb}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={match.pathname}>
                                            {match.staticData.breadcrumb}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
