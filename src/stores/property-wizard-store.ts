import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PropertyType } from "@/lib/api/types";

export interface WizardRoom {
  id: string;
  roomNumber: string;
  capacity: number;
  rentAmount: number;
  depositAmount: number;
  description?: string;
  status?: "PENDING" | "SUCCESS" | "ERROR";
  errorMessage?: string;
}

export interface PropertyWizardState {
  currentStep: number;
  // Step 1: Basics
  title: string;
  type: PropertyType;
  description: string;
  // Step 2: Location & Amenities
  address: string;
  city: string;
  area: string;
  amenities: string[];
  // Step 3: Photos
  images: string[];
  // Step 4: Rooms
  rooms: WizardRoom[];
  // Wizard Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateBasics: (data: { title: string; type: PropertyType; description: string }) => void;
  updateLocation: (data: { address: string; city: string; area: string; amenities: string[] }) => void;
  updateImages: (images: string[]) => void;
  setRooms: (rooms: WizardRoom[]) => void;
  addRoom: (room: Omit<WizardRoom, "id">) => void;
  updateRoom: (id: string, room: Partial<WizardRoom>) => void;
  removeRoom: (id: string) => void;
  resetWizard: () => void;
}

const initialValues = {
  currentStep: 1,
  title: "",
  type: "APARTMENT" as PropertyType,
  description: "",
  address: "",
  city: "",
  area: "",
  amenities: ["WiFi", "Kitchen", "Air Conditioning", "Washing Machine"],
  images: [],
  rooms: [
    {
      id: "room-1",
      roomNumber: "A-101",
      capacity: 1,
      rentAmount: 800,
      depositAmount: 800,
      description: "Master bedroom with attached private bath and balcony",
    },
  ],
};

export const usePropertyWizardStore = create<PropertyWizardState>()(
  persist(
    (set) => ({
      ...initialValues,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(5, state.currentStep + 1) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

      updateBasics: (data) => set({ ...data }),
      updateLocation: (data) => set({ ...data }),
      updateImages: (images) => set({ images }),

      setRooms: (rooms) => set({ rooms }),
      addRoom: (room) =>
        set((state) => ({
          rooms: [...state.rooms, { ...room, id: `room-${Date.now()}` }],
        })),
      updateRoom: (id, updated) =>
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...updated } : r)),
        })),
      removeRoom: (id) =>
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== id),
        })),

      resetWizard: () => set(initialValues),
    }),
    {
      name: "nestly-property-wizard-draft",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
