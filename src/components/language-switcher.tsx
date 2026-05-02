import { Button } from "./ui/button";
import GreatBritainIcon from "./icons/great-britain";
import RussianIcon from "./icons/russia";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
    };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    {i18n.language === "rus" ? (
                        <RussianIcon />
                    ) : (
                        <GreatBritainIcon />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onClick={() => changeLanguage("en")}
                        disabled={i18n.language === "en"}
                    >
                        <GreatBritainIcon />
                        English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => changeLanguage("rus")}
                        disabled={i18n.language === "rus"}
                    >
                        <RussianIcon />
                        Русский
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
