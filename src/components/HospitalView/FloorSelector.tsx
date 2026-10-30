import React from 'react';
import { FLOORS_DATA } from '../../data/mockData';

interface FloorSelectorProps {
  currentFloor: string;
  onSelectFloor: (floorId: string) => void;
}

export const FloorSelector: React.FC<FloorSelectorProps> = ({
  currentFloor,
  onSelectFloor,
}) => {
  return (
    <div className="flex flex-col gap-2.5 w-44 md:w-52">
      {FLOORS_DATA.map((floor) => {
        const isSelected = currentFloor === floor.id;
        return (
          <button
            key={floor.id}
            onClick={() => onSelectFloor(floor.id)}
            className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-300 cursor-pointer ${
              isSelected
                ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/80 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.45)] scale-102'
                : 'bg-[#0b1626]/75 hover:bg-[#10213b]/85 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {/* Floor badge indicator */}
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm font-mono shrink-0 transition-colors ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#06b6d4]'
                  : 'bg-slate-800/80 text-slate-400'
              }`}
            >
              {floor.id}
            </div>

            {/* Floor description */}
            <div className="flex-1 min-w-0">
              <div
                className={`text-xs font-semibold leading-snug truncate ${
                  isSelected ? 'text-white' : 'text-slate-300'
                }`}
              >
                {floor.name.replace(`${floor.id} `, '')}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {floor.occupiedBeds}/{floor.totalBeds} Beds
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

