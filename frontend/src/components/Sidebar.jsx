import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = (showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users
  ).filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100">
      {/* Header section */}
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-5 lg:size-6" />
            <span className="font-medium hidden lg:block text-lg">Contacts</span>
          </div>
          
          {/* Mobile search toggle */}
          <button 
            className="lg:hidden p-1 rounded-full hover:bg-base-300 transition-colors"
            onClick={() => setIsSearchFocused(!isSearchFocused)}
          >
            <Search className="size-5" />
          </button>
        </div>

        {/* Search input - always visible on desktop, conditionally on mobile */}
        <AnimatePresence>
          {(isSearchFocused || !isSearchFocused) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`mt-3 ${isSearchFocused ? "block" : "hidden lg:block"}`}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-base-300 transition-colors"
                  >
                    <X className="size-4 text-zinc-400" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters section */}
        <div className="mt-3">
          <button 
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <span>Filters</span>
            {isFiltersOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 pt-2">
                  <label className="cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showOnlineOnly}
                      onChange={(e) => setShowOnlineOnly(e.target.checked)}
                      className="checkbox checkbox-xs lg:checkbox-sm"
                    />
                    <span className="text-xs lg:text-sm">Online only</span>
                  </label>
                  <span className="text-xs text-zinc-500">
                    ({onlineUsers.length - 1} online)
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Users list */}
      <div className="overflow-y-auto w-full py-2 flex-1">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <motion.button
              key={user._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300/50 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-300/70" : ""}
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <motion.img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-10 lg:size-12 object-cover rounded-full"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
                {onlineUsers.includes(user._id) && (
                  <motion.span
                    className="absolute bottom-0 right-0 size-2.5 lg:size-3 bg-green-500 
                    rounded-full ring-2 ring-base-100"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  />
                )}
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-xs lg:text-sm text-zinc-400 flex items-center gap-1">
                  <span className={`inline-block size-2 rounded-full ${onlineUsers.includes(user._id) ? "bg-green-500" : "bg-zinc-500"}`} />
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </motion.button>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-zinc-500 py-8 flex flex-col items-center gap-2"
          >
            <Search className="size-6" />
            <div>
              {searchQuery || showOnlineOnly ? "No matching contacts" : "No contacts found"}
            </div>
          </motion.div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;