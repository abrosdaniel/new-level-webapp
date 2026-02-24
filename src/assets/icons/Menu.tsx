import React from "react";

interface SVGIconProps {
  fill?: string;
  stroke?: string;
}

const HomeIcon: React.FC<SVGIconProps> = ({ fill, stroke }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path
        d="M2.5 10.9384C2.5 9.71422 3.06058 8.55744 4.02142 7.79888L9.52143 3.45677C10.9747 2.30948 13.0253 2.30948 14.4786 3.45677L19.9786 7.79888C20.9394 8.55744 21.5 9.71422 21.5 10.9384V17.5C21.5 19.7091 19.7091 21.5 17.5 21.5H16C15.4477 21.5 15 21.0523 15 20.5V17.5C15 16.3954 14.1046 15.5 13 15.5H11C9.89543 15.5 9 16.3954 9 17.5V20.5C9 21.0523 8.55229 21.5 8 21.5H6.5C4.29086 21.5 2.5 19.7091 2.5 17.5L2.5 10.9384Z"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.63636"
      />
    </svg>
  );
};

const CoursesIcon: React.FC<SVGIconProps> = ({ fill, stroke }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path
        d="M7.78516 13.9585L13.827 7.91664L16.6955 10.7851L10.6537 16.827L7.78516 13.9585Z"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.5"
      />
      <path
        d="M13.6002 2.4101C13.9907 2.01957 14.6238 2.01957 15.0144 2.4101L16.2214 3.61715L17.82 2.01856C18.348 1.49054 19.204 1.48996 19.7321 2.01787L22.6006 4.88635C23.1287 5.41443 23.1287 6.27105 22.6006 6.79913L21.002 8.39772L22.2056 9.60132C22.596 9.99185 22.5961 10.6251 22.2056 11.0155L20.2735 12.9476C19.883 13.3381 19.2498 13.338 18.8593 12.9476L11.668 5.75642C11.2775 5.3659 11.2775 4.73273 11.668 4.34221L13.6002 2.4101Z"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.5"
      />
      <path
        d="M4.19627 11.8037C4.58672 11.4136 5.22004 11.4136 5.61048 11.8037L12.8017 18.995C13.1921 19.3854 13.1919 20.0186 12.8017 20.4092L10.9953 22.2156C10.5351 22.6758 9.78921 22.6763 9.32901 22.2163L8.2497 21.137L6.64904 22.7376C6.12094 23.2654 5.26493 23.2649 4.73696 22.737L1.86848 19.8685C1.34058 19.3405 1.34004 18.4845 1.86779 17.9564L3.46845 16.3557L2.38983 15.2771C1.9297 14.8169 1.92966 14.0703 2.38983 13.6102L4.19627 11.8037Z"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.5"
      />
    </svg>
  );
};

const RecipeIcon: React.FC<SVGIconProps> = ({ fill, stroke }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path
        d="M20.6226 1.5V15.15H15.5977V6.52501C15.5977 5.1923 16.1271 3.91415 17.0694 2.97178C18.0118 2.02941 19.2899 1.5 20.6226 1.5Z"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.6953 15H20.6203V21.3747C20.6203 21.7526 20.4702 22.1151 20.2029 22.3823C19.9357 22.6496 19.5732 22.7997 19.1953 22.7997H19.1203C18.7424 22.7997 18.3799 22.6496 18.1127 22.3823C17.8454 22.1151 17.6953 21.7526 17.6953 21.3747V15Z"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.72501 22.7997C7.26752 22.7997 6.82876 22.618 6.50526 22.2945C6.18176 21.971 6 21.5322 6 21.0747L6.75 11.6997H8.77501L9.52501 21.0747C9.52523 21.3077 9.47824 21.5383 9.3869 21.7526C9.29556 21.967 9.16176 22.1606 8.99355 22.3218C8.82534 22.483 8.6262 22.6084 8.40818 22.6906C8.19016 22.7727 7.95778 22.8098 7.72501 22.7997Z"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.72501 11.7003C9.92035 11.7003 11.7 9.48411 11.7 6.7503C11.7 4.01649 9.92035 1.80029 7.72501 1.80029C5.52968 1.80029 3.75 4.01649 3.75 6.7503C3.75 9.48411 5.52968 11.7003 7.72501 11.7003Z"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const VideoIcon: React.FC<SVGIconProps> = ({ fill, stroke }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <rect
        x="2"
        y="6"
        width="14"
        height="13"
        rx="3.5"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.5"
      />
      <path
        d="M16 11.1606L20.1162 8.3063C20.912 7.75446 22 8.324 22 9.29241V15.7255C22 16.6903 20.919 17.2607 20.1226 16.716L16 13.8964V11.1606Z"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.5"
      />
    </svg>
  );
};

const ProfileIcon: React.FC<SVGIconProps> = ({ fill, stroke }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12.0039"
        cy="7"
        r="4"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.5"
      />
      <path
        d="M4.00781 17.4144C4.00781 16.682 4.35404 15.9917 5.00239 15.651C6.27069 14.9844 8.70216 14.001 12.0078 14.001C15.3135 14.001 17.7449 14.9844 19.0132 15.651C19.6616 15.9917 20.0078 16.682 20.0078 17.4144C20.0078 18.2421 19.5643 19.0056 18.7929 19.3055C17.4742 19.8181 15.1312 20.501 12.0078 20.501C8.88441 20.501 6.54146 19.8181 5.22273 19.3055C4.45134 19.0056 4.00781 18.2421 4.00781 17.4144Z"
        fill={fill || "currentColor"}
        stroke={stroke || "currentColor"}
        strokeWidth="1.5"
      />
    </svg>
  );
};

export { HomeIcon, CoursesIcon, RecipeIcon, VideoIcon, ProfileIcon };
