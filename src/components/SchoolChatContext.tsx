"use client";

import { useEffect } from "react";
import { useChatContext } from "./ChatProvider";

export default function SchoolChatContext({ schoolName }: { schoolName: string }) {
  const { setSchoolContext } = useChatContext();

  useEffect(() => {
    setSchoolContext(schoolName);
    return () => {
      setSchoolContext(null);
    };
  }, [schoolName, setSchoolContext]);

  return null;
}
