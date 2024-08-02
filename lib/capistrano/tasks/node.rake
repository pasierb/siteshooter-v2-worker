namespace :deploy do
  before :updated, :composer do
    on roles(:app) do
      within release_path do
        execute :npm, "install"
      end
    end
  end

  after :updated, :migrate do
    on roles(:app) do
      within release_path do
        # restart etc
      end
    end
  end
end
