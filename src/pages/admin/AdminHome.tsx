import { initialUsers } from '../../data/mockData';

export const AdminHome = () => {
  const activeUsersCount = initialUsers.filter(u => u.status === 'Ativo').length;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-background-card border border-border-main p-6 rounded-lg w-[280px]">
        <span className="text-[13px] text-content-tertiary font-medium mb-2 block">
          Usuários Ativos
        </span>
        <span className="text-[36px] font-bold text-content-main">
          {activeUsersCount}
        </span>
      </div>
    </div>
  );
};
