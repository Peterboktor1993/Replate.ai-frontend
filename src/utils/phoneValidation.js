const VALID_AREA_CODES = [
  201, 202, 203, 205, 206, 207, 208, 209, 210, 212, 213, 214, 215, 216, 217,
  218, 219, 224, 225, 228, 229, 231, 234, 239, 240, 248, 251, 252, 253, 254,
  256, 260, 262, 267, 269, 270, 276, 281, 301, 302, 303, 304, 305, 307, 308,
  309, 310, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 323, 325, 330,
  331, 334, 336, 337, 339, 347, 351, 352, 360, 361, 364, 380, 385, 386, 401,
  402, 404, 405, 406, 407, 408, 409, 410, 412, 413, 414, 415, 417, 419, 423,
  424, 425, 430, 432, 434, 435, 440, 442, 443, 458, 463, 464, 469, 470, 475,
  478, 479, 480, 484, 501, 502, 503, 504, 505, 507, 508, 509, 510, 512, 513,
  515, 516, 517, 518, 520, 530, 540, 541, 551, 559, 561, 562, 563, 564, 567,
  570, 571, 573, 574, 575, 580, 585, 586, 601, 602, 603, 605, 606, 607, 608,
  609, 610, 612, 614, 615, 616, 617, 618, 619, 620, 623, 626, 628, 629, 630,
  631, 636, 641, 646, 650, 651, 657, 660, 661, 662, 667, 669, 678, 681, 682,
  701, 702, 703, 704, 706, 707, 708, 712, 713, 714, 715, 716, 717, 718, 719,
  720, 724, 725, 727, 731, 732, 734, 737, 740, 743, 747, 754, 757, 760, 762,
  763, 765, 769, 770, 772, 773, 774, 775, 779, 781, 785, 786, 801, 802, 803,
  804, 805, 806, 808, 810, 812, 813, 814, 815, 816, 817, 818, 828, 830, 831,
  832, 843, 845, 847, 848, 850, 856, 857, 858, 859, 860, 862, 863, 864, 865,
  870, 872, 878, 901, 903, 904, 906, 907, 908, 909, 910, 912, 913, 914, 915,
  916, 917, 918, 919, 920, 925, 928, 929, 931, 934, 936, 937, 940, 941, 947,
  949, 951, 952, 954, 956, 959, 970, 971, 972, 973, 978, 979, 980, 984, 985,
  989,

  // Canadian Area Codes
  204, 236, 249, 250, 289, 306, 343, 365, 403, 416, 418, 431, 437, 438, 450,
  506, 514, 519, 548, 579, 581, 587, 604, 613, 639, 647, 672, 705, 709, 742,
  778, 780, 782, 807, 819, 825, 867, 873, 902, 905,
];

export const cleanPhoneNumber = (phone) => {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
};

export const formatPhoneNumber = (phone) => {
  const cleaned = cleanPhoneNumber(phone);

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7
    )}`;
  }

  return phone;
};

export const validateNorthAmericanPhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    return {
      isValid: false,
      error: "Phone number is required",
      cleanedPhone: "",
    };
  }

  const cleaned = cleanPhoneNumber(phone);

  if (/[a-zA-Z]/.test(phone)) {
    return {
      isValid: false,
      error: "Phone number cannot contain letters",
      cleanedPhone: cleaned,
    };
  }

  if (cleaned.length === 0) {
    return {
      isValid: false,
      error: "Phone number is required",
      cleanedPhone: cleaned,
    };
  }

  if (cleaned.length < 10) {
    return {
      isValid: false,
      error: "Phone number is too short (minimum 10 digits)",
      cleanedPhone: cleaned,
    };
  }

  if (cleaned.length > 11) {
    return {
      isValid: false,
      error: "Phone number is too long (maximum 11 digits)",
      cleanedPhone: cleaned,
    };
  }

  let areaCode;
  let localNumber;

  if (cleaned.length === 10) {
    areaCode = parseInt(cleaned.slice(0, 3));
    localNumber = cleaned.slice(3);
  } else if (cleaned.length === 11) {
    if (!cleaned.startsWith("1")) {
      return {
        isValid: false,
        error: "Invalid country code (must be 1 for US/Canada)",
        cleanedPhone: cleaned,
      };
    }
    areaCode = parseInt(cleaned.slice(1, 4));
    localNumber = cleaned.slice(4);
  } else {
    return {
      isValid: false,
      error: "Invalid phone number length",
      cleanedPhone: cleaned,
    };
  }

  if (!VALID_AREA_CODES.includes(areaCode)) {
    return {
      isValid: false,
      error: "Invalid area code for US/Canada",
      cleanedPhone: cleaned,
    };
  }

  const exchangeCode = localNumber.slice(0, 3);
  const subscriberNumber = localNumber.slice(3);

  if (exchangeCode.startsWith("0") || exchangeCode.startsWith("1")) {
    return {
      isValid: false,
      error: "Invalid exchange code (cannot start with 0 or 1)",
      cleanedPhone: cleaned,
    };
  }

  if (
    cleaned === "0000000000" ||
    cleaned === "1111111111" ||
    cleaned === "1234567890" ||
    cleaned === "0123456789"
  ) {
    return {
      isValid: false,
      error: "Invalid phone number pattern",
      cleanedPhone: cleaned,
    };
  }

  if (new Set(localNumber).size === 1) {
    return {
      isValid: false,
      error: "Invalid phone number (all digits cannot be the same)",
      cleanedPhone: cleaned,
    };
  }

  return {
    isValid: true,
    error: null,
    cleanedPhone: cleaned,
    formattedPhone: formatPhoneNumber(cleaned),
    areaCode: areaCode,
    countryCode: cleaned.length === 11 ? "1" : null,
  };
};

export const autoFormatPhone = (input, previousValue = "") => {
  const cleaned = cleanPhoneNumber(input);

  if (previousValue && input.length < previousValue.length) {
    return input;
  }

  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7
    )}`;
  }

  return input;
};

export const getPhoneValidationMessage = (phone) => {
  const validation = validateNorthAmericanPhone(phone);
  return validation.isValid ? "" : validation.error;
};

export const getPhoneCountry = (phone) => {
  const validation = validateNorthAmericanPhone(phone);
  if (!validation.isValid) return null;

  const areaCode = validation.areaCode;

  const canadianAreaCodes = [
    204, 236, 249, 250, 289, 306, 343, 365, 403, 416, 418, 431, 437, 438, 450,
    506, 514, 519, 548, 579, 581, 587, 604, 613, 639, 647, 672, 705, 709, 742,
    778, 780, 782, 807, 819, 825, 867, 873, 902, 905,
  ];

  return canadianAreaCodes.includes(areaCode) ? "CA" : "US";
};
